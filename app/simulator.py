"""Asyncio simulator — mutates device states and triggers broadcasts."""

import asyncio
import random
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from . import store
from .ws import manager
from .alerts import check_alerts

_local_tz = ZoneInfo("Asia/Dhaka")
_office_open_hour = 9
_office_close_hour = 17
_tick_interval = 5  # seconds between ticks


def _now_local() -> datetime:
    return datetime.now(_local_tz)


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
    """Build a state broadcast payload that includes today_kwh."""
    from .db import get_today_kwh
    state = [d.model_dump() for d in store.get_all_devices()]
    today_kwh = await get_today_kwh()
    return {"type": "state", "devices": state, "today_kwh": today_kwh}


async def run() -> None:
    """Main simulator loop running as a background asyncio task."""
    while True:
        await asyncio.sleep(_tick_interval)
        now = _now_local()
        is_office_hours = _office_open_hour <= now.hour < _office_close_hour

        devices = store.get_all_devices()
        changed = False
        changes: list[dict] = []

        for device in devices:
            old_status = device.status.value
            if is_office_hours:
                # During office hours: mostly ON, occasional toggles
                if device.status == store.Status.off:
                    if random.random() < 0.05:
                        store.set_device_status(device.id, store.Status.on)
                        changed = True
                        changes.append({
                            "device_id": device.id,
                            "device_name": device.name,
                            "room": device.room,
                            "device_type": device.type.value,
                            "old_status": old_status,
                            "new_status": "on",
                        })
                else:
                    if random.random() < 0.02:
                        store.set_device_status(device.id, store.Status.off)
                        changed = True
                        changes.append({
                            "device_id": device.id,
                            "device_name": device.name,
                            "room": device.room,
                            "device_type": device.type.value,
                            "old_status": old_status,
                            "new_status": "off",
                        })
            else:
                # After hours: mostly OFF, occasional "forgotten" devices
                if device.status == store.Status.on:
                    if random.random() < 0.10:
                        store.set_device_status(device.id, store.Status.off)
                        changed = True
                        changes.append({
                            "device_id": device.id,
                            "device_name": device.name,
                            "room": device.room,
                            "device_type": device.type.value,
                            "old_status": old_status,
                            "new_status": "off",
                        })
                else:
                    # Small chance a device gets left on (simulates someone forgetting)
                    if random.random() < 0.008:
                        store.set_device_status(device.id, store.Status.on)
                        changed = True
                        changes.append({
                            "device_id": device.id,
                            "device_name": device.name,
                            "room": device.room,
                            "device_type": device.type.value,
                            "old_status": old_status,
                            "new_status": "on",
                        })

        # Record cumulative watt-seconds every tick (regardless of state changes)
        from .db import record_usage
        total_watts = _get_total_watts()
        await record_usage(total_watts * _tick_interval)

        if changed:
            # Persist logs to SQLite
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
