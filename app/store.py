"""In-memory store — single source of truth for all 15 devices."""

import os
from datetime import datetime, timezone

from .models import Device, DeviceType, Status

ROOMS = {
    "drawing": "Drawing Room",
    "work1": "Work Room 1",
    "work2": "Work Room 2",
}

FAN_WATTS = 60
LIGHT_WATTS = 15

OFFICE_OPEN_HOUR = int(os.getenv("OFFICE_OPEN_HOUR", "9"))
OFFICE_CLOSE_HOUR = int(os.getenv("OFFICE_CLOSE_HOUR", "17"))
ELECTRICITY_RATE_PER_KWH = float(os.getenv("ELECTRICITY_RATE_PER_KWH", "8.0"))

_devices: dict[str, Device] = {}


def get_office_hours() -> dict:
    """Return current office hours configuration."""
    return {
        "open_hour": OFFICE_OPEN_HOUR,
        "close_hour": OFFICE_CLOSE_HOUR,
        "rate_per_kwh": ELECTRICITY_RATE_PER_KWH,
    }


def set_office_hours(open_hour: int, close_hour: int) -> bool:
    """Update office hours at runtime. Returns True if valid."""
    global OFFICE_OPEN_HOUR, OFFICE_CLOSE_HOUR
    if not (0 <= open_hour <= 23 and 0 <= close_hour <= 23):
        return False
    if open_hour >= close_hour:
        return False
    OFFICE_OPEN_HOUR = open_hour
    OFFICE_CLOSE_HOUR = close_hour
    return True


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _seed_devices() -> None:
    global _devices
    _devices.clear()
    for room_key in ROOMS:
        for i in range(1, 3):
            device_id = f"{room_key}-fan-{i}"
            _devices[device_id] = Device(
                id=device_id,
                name=f"Fan {i}",
                type=DeviceType.fan,
                room=room_key,
                status=Status.off,
                watts=FAN_WATTS,
                last_changed=_now_iso(),
            )
        for i in range(1, 4):
            device_id = f"{room_key}-light-{i}"
            _devices[device_id] = Device(
                id=device_id,
                name=f"Light {i}",
                type=DeviceType.light,
                room=room_key,
                status=Status.off,
                watts=LIGHT_WATTS,
                last_changed=_now_iso(),
            )


def get_all_devices() -> list[Device]:
    if not _devices:
        _seed_devices()
    return list(_devices.values())


def get_device(device_id: str) -> Device | None:
    if not _devices:
        _seed_devices()
    return _devices.get(device_id)


def set_device_status(device_id: str, status: Status) -> Device | None:
    if not _devices:
        _seed_devices()
    device = _devices.get(device_id)
    if device is None:
        return None
    device.status = status
    device.last_changed = _now_iso()
    return device


def get_devices_by_room(room: str) -> list[Device]:
    return [d for d in get_all_devices() if d.room == room]
