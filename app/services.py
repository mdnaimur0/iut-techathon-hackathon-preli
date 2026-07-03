"""Shared read logic used by both the API and the Discord bot."""

from datetime import datetime, timezone

from . import store
from .models import Usage


def get_state() -> list[dict]:
    """Return all devices as plain dicts."""
    return [d.model_dump() for d in store.get_all_devices()]


def get_room(name: str) -> dict | None:
    """Return room info with its devices, or None if room not found."""
    room_key = _resolve_room_key(name)
    if room_key is None:
        return None
    devices = store.get_devices_by_room(room_key)
    return {
        "room": room_key,
        "display_name": store.ROOMS.get(room_key, name),
        "devices": [d.model_dump() for d in devices],
    }


def get_usage() -> dict:
    """Return current power usage across the office."""
    devices = store.get_all_devices()
    total_watts = sum(d.watts for d in devices if d.status == store.Status.on)
    per_room: dict[str, int] = {}
    for d in devices:
        if d.status == store.Status.on:
            per_room[d.room] = per_room.get(d.room, 0) + d.watts
    return {
        "total_watts_now": total_watts,
        "per_room_watts": per_room,
    }


def get_alerts() -> list[dict]:
    """Return current active alerts."""
    from .alerts import get_active_alerts
    return [a.model_dump() for a in get_active_alerts()]


def _resolve_room_key(name: str) -> str | None:
    """Resolve various room name formats to the canonical key."""
    normalized = name.strip().lower().replace(" ", "")
    aliases = {
        "drawing": "drawing",
        "drawingroom": "drawing",
        "work1": "work1",
        "workroom1": "work1",
        "workroom1": "work1",
        "work2": "work2",
        "workroom2": "work2",
        "workroom2": "work2",
    }
    return aliases.get(normalized)
