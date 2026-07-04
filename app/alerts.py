"""Alert engine — after-hours and room-on-2h rules."""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from .models import Alert

_local_tz = ZoneInfo("Asia/Dhaka")

_active_alerts: list[Alert] = []
_alert_counter: int = 0


def _now_local() -> datetime:
    return datetime.now(_local_tz)


def _make_alert_id() -> str:
    global _alert_counter
    _alert_counter += 1
    return f"alert-{_alert_counter}-{int(_now_local().timestamp())}"


def check_alerts(devices: list[dict]) -> list[Alert]:
    """Evaluate alert conditions and return newly created alerts."""
    from . import store

    new_alerts: list[Alert] = []
    now = _now_local()
    office_open = int(store.OFFICE_OPEN_HOUR) if hasattr(store, "OFFICE_OPEN_HOUR") else 9
    office_close = int(store.OFFICE_CLOSE_HOUR) if hasattr(store, "OFFICE_CLOSE_HOUR") else 17
    is_after_hours = now.hour >= office_close or now.hour < office_open

    if is_after_hours:
        on_devices = [d for d in devices if d["status"] == "on"]
        if on_devices:
            room_counts: dict[str, dict[str, int]] = {}
            for d in on_devices:
                room = d["room"]
                if room not in room_counts:
                    room_counts[room] = {"fan": 0, "light": 0}
                room_counts[room][d["type"]] += 1

            for room, counts in room_counts.items():
                parts = []
                if counts["fan"] > 0:
                    parts.append(f"{counts['fan']} fan{'s' if counts['fan'] > 1 else ''}")
                if counts["light"] > 0:
                    parts.append(f"{counts['light']} light{'s' if counts['light'] > 1 else ''}")
                devices_str = " and ".join(parts)
                alert = Alert(
                    id=_make_alert_id(),
                    severity="warning",
                    message=f"{store.ROOMS.get(room, room)} has {devices_str} ON after hours ({now.strftime('%I:%M %p')})",
                    room=room,
                    created_at=now.isoformat(),
                )
                if not _is_duplicate(alert):
                    new_alerts.append(alert)

    from datetime import timedelta
    for room_key in store.ROOMS:
        room_devices = [d for d in devices if d["room"] == room_key]
        all_on = all(d["status"] == "on" for d in room_devices) and len(room_devices) > 0
        if all_on:
            first_changed = min(
                (datetime.fromisoformat(d["last_changed"]) for d in room_devices),
                default=now,
            )
            if now - first_changed > timedelta(hours=2):
                alert = Alert(
                    id=_make_alert_id(),
                    severity="critical",
                    message=f"{store.ROOMS.get(room_key, room_key)} has ALL devices ON for over 2 hours continuously",
                    room=room_key,
                    created_at=now.isoformat(),
                )
                if not _is_duplicate(alert):
                    new_alerts.append(alert)

    _active_alerts.extend(new_alerts)
    return new_alerts


def get_active_alerts() -> list[Alert]:
    return list(_active_alerts)


def recheck_alerts(devices: list[dict]) -> list[Alert]:
    """Re-evaluate alert conditions with current device state.

    Called when office hours change, scenarios activate, etc.
    Same logic as check_alerts but intended for external triggers.
    """
    return check_alerts(devices)


def _is_duplicate(new_alert: Alert) -> bool:
    for existing in _active_alerts:
        if existing.message == new_alert.message and existing.room == new_alert.room:
            return True
    return False
