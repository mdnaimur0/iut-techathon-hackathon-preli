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


async def run() -> None:
    """Main simulator loop running as a background asyncio task."""
    while True:
        await asyncio.sleep(_tick_interval)
        now = _now_local()
        is_office_hours = _office_open_hour <= now.hour < _office_close_hour

        devices = store.get_all_devices()
        changed = False

        for device in devices:
            if is_office_hours:
                # During office hours: mostly ON, occasional toggles
                if device.status == store.Status.off:
                    if random.random() < 0.05:
                        store.set_device_status(device.id, store.Status.on)
                        changed = True
                else:
                    if random.random() < 0.02:
                        store.set_device_status(device.id, store.Status.off)
                        changed = True
            else:
                # After hours: mostly OFF, occasional "forgotten" devices
                if device.status == store.Status.on:
                    if random.random() < 0.10:
                        store.set_device_status(device.id, store.Status.off)
                        changed = True
                else:
                    # Small chance a device gets left on (simulates someone forgetting)
                    if random.random() < 0.008:
                        store.set_device_status(device.id, store.Status.on)
                        changed = True

        if changed:
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
