"""Asyncio simulator — random device state mutations and broadcasts.

Toggles devices randomly with correlated room behavior (when one device
turns on, others in the same room are more likely to follow).

Office hours from the dashboard/env are NOT used here — they are only
used by the alert engine (alerts.py) to detect after-hours violations.
"""

import asyncio
import random

from . import store
from .ws import manager
from .alerts import check_alerts

_tick_interval = 5  # seconds between ticks

# ── Scenario mode ──────────────────────────────────────────────────────────

_active_scenario: str | None = None

SCENARIOS = {
    "after-hours-forgotten": "Simulate forgotten devices after hours",
    "all-on": "Turn all devices ON",
    "energy-saver": "Turn all devices OFF",
    "lunch-break": "Work rooms off, drawing room on",
    "normal": "Return to normal simulation",
}


def set_scenario(name: str) -> bool:
    """Activate a demo scenario. Returns True if valid."""
    global _active_scenario
    if name == "normal":
        _active_scenario = None
        return True
    if name in SCENARIOS:
        _active_scenario = name
        _apply_scenario(name)
        return True
    return False


def get_scenario() -> str | None:
    return _active_scenario


def _apply_scenario(name: str) -> None:
    """Force device states for a demo scenario."""
    devices = store.get_all_devices()
    if name == "all-on":
        for d in devices:
            store.set_device_status(d.id, store.Status.on)
    elif name == "energy-saver":
        for d in devices:
            store.set_device_status(d.id, store.Status.off)
    elif name == "lunch-break":
        for d in devices:
            if d.room in ("work1", "work2"):
                store.set_device_status(d.id, store.Status.off)
            else:
                store.set_device_status(d.id, store.Status.on)
    elif name == "after-hours-forgotten":
        for d in devices:
            store.set_device_status(d.id, store.Status.off)
        work2_devices = [d for d in devices if d.room == "work2"]
        forgotten = random.sample(work2_devices, min(3, len(work2_devices)))
        for d in forgotten:
            store.set_device_status(d.id, store.Status.on)


# ── Correlated room behavior ───────────────────────────────────────────────

def _correlated_boost(room: str, current_status: str) -> float:
    """Return a probability multiplier based on room activity.

    If several devices in a room are already ON, there's a higher chance
    the remaining ones turn ON too (someone entered the room).
    Conversely, if most are OFF, the last ON device is more likely to turn OFF.
    """
    room_devices = store.get_devices_by_room(room)
    total = len(room_devices)
    if total == 0:
        return 1.0

    on_count = sum(1 for d in room_devices if d.status == store.Status.on)
    ratio = on_count / total

    if current_status == "off":
        return 1.0 + ratio * 1.5
    else:
        return 1.0 + (1.0 - ratio) * 1.2


# ── Main loop ──────────────────────────────────────────────────────────────

def _make_change(device, old_status: str, new_status: str) -> dict:
    return {
        "device_id": device.id,
        "device_name": device.name,
        "room": device.room,
        "device_type": device.type.value,
        "old_status": old_status,
        "new_status": new_status,
    }


async def _record_changes(changes: list[dict]) -> None:
    """Persist device state changes to SQLite."""
    from .db import record_change
    for c in changes:
        await record_change(
            device_id=c["device_id"],
            device_name=c["device_name"],
            room=c["room"],
            device_type=c["device_type"],
            old_status=c["old_status"],
            new_status=c["new_status"],
        )


def _get_total_watts() -> int:
    """Sum watts across all devices that are currently ON."""
    return sum(d.watts for d in store.get_all_devices() if d.status == store.Status.on)


async def _build_state_payload() -> dict:
    """Build a state broadcast payload that includes today_kwh and active scenario."""
    from .db import get_today_kwh
    state = [d.model_dump() for d in store.get_all_devices()]
    today_kwh = await get_today_kwh()
    return {
        "type": "state",
        "devices": state,
        "today_kwh": today_kwh,
        "active_scenario": _active_scenario,
    }


async def run() -> None:
    """Main simulator loop running as a background asyncio task."""
    while True:
        await asyncio.sleep(_tick_interval)

        # If a scenario is active, freeze device states but still record
        # cumulative energy usage and check time-based alerts (2-hour rule).
        if _active_scenario is not None:
            from .db import record_usage
            total_watts = _get_total_watts()
            await record_usage(total_watts * _tick_interval)
            payload = await _build_state_payload()
            await manager.broadcast(payload)

            # 2-hour rule still applies during scenarios
            new_alerts = check_alerts(payload["devices"])
            if new_alerts:
                alert_dicts = [a.model_dump() for a in new_alerts]
                await manager.broadcast({"type": "alerts", "alerts": alert_dicts})
                try:
                    from .bot import push_alert
                    for alert in new_alerts:
                        await push_alert(alert.message)
                except Exception:
                    pass
            continue

        # Random toggle with correlated room behavior
        devices = store.get_all_devices()
        changed = False
        changes: list[dict] = []

        for device in devices:
            old_status = device.status.value
            corr_mult = _correlated_boost(device.room, old_status)

            if device.status == store.Status.off:
                prob_on = 0.04 * corr_mult
                if random.random() < prob_on:
                    store.set_device_status(device.id, store.Status.on)
                    changed = True
                    changes.append(_make_change(device, old_status, "on"))
            else:
                prob_off = 0.02 * corr_mult
                if random.random() < prob_off:
                    store.set_device_status(device.id, store.Status.off)
                    changed = True
                    changes.append(_make_change(device, old_status, "off"))

        # Record cumulative watt-seconds every tick
        from .db import record_usage
        total_watts = _get_total_watts()
        await record_usage(total_watts * _tick_interval)

        if changed:
            await _record_changes(changes)

        # Always broadcast latest state so the dashboard stays in sync
        payload = await _build_state_payload()
        await manager.broadcast(payload)

        if changed:
            new_alerts = check_alerts(payload["devices"])
            if new_alerts:
                alert_dicts = [a.model_dump() for a in new_alerts]
                await manager.broadcast({"type": "alerts", "alerts": alert_dicts})
                try:
                    from .bot import push_alert
                    for alert in new_alerts:
                        await push_alert(alert.message)
                except Exception:
                    pass
