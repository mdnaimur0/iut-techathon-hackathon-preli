from enum import Enum
from pydantic import BaseModel


class DeviceType(str, Enum):
    fan = "fan"
    light = "light"


class Status(str, Enum):
    on = "on"
    off = "off"


class Device(BaseModel):
    id: str
    name: str
    type: DeviceType
    room: str
    status: Status
    watts: int
    last_changed: str


class Alert(BaseModel):
    id: str
    severity: str
    message: str
    room: str | None
    created_at: str


class Usage(BaseModel):
    total_watts_now: int
    per_room_watts: dict[str, int]
    today_kwh: float
