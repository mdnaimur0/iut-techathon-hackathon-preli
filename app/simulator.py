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

        if changed:
            # Persist logs to SQLite
            await _record_changes(changes)

            state = [d.model_dump() for d in store.get_all_devices()]
            await manager.broadcast({"type": "state", "devices": state})
            new_alerts = check_alerts(state)
            if new_alerts:
                alert_dicts = [a.model_dump() for a in new_alerts]
                await manager.broadcast({"type": "alerts", "alerts": alert_dicts})
                try:
                    from .bot import push_alert
                    for alert in new_alerts:
                        await push_alert(alert.message)
                except Exception:
                    pass
