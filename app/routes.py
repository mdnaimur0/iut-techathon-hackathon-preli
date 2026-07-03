"""REST API routes."""

from fastapi import APIRouter, HTTPException

from . import store
from .services import get_state, get_room, get_usage, get_alerts

router = APIRouter()


@router.get("/state")
async def api_state():
    """Return the current state of all devices."""
    return {"devices": get_state()}


@router.get("/rooms/{room_id}")
async def api_room(room_id: str):
    """Return detailed status of a specific room."""
    room = get_room(room_id)
    if room is None:
        raise HTTPException(status_code=404, detail=f"Room '{room_id}' not found")
    return room


@router.get("/usage")
async def api_usage():
    """Return current power consumption metrics."""
    from .db import get_today_kwh
    usage = get_usage()
    usage["today_kwh"] = await get_today_kwh()
    return usage


@router.get("/alerts")
async def api_alerts():
    """Return active alerts."""
    return {"alerts": get_alerts()}
