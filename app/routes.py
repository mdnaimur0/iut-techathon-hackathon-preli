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
    today_kwh = await get_today_kwh()
    usage["today_kwh"] = today_kwh
    usage["estimated_daily_cost"] = round(today_kwh * store.ELECTRICITY_RATE_PER_KWH, 2)
    usage["rate_per_kwh"] = store.ELECTRICITY_RATE_PER_KWH
    return usage


@router.get("/alerts")
async def api_alerts():
    """Return active alerts."""
    return {"alerts": get_alerts()}


@router.get("/logs")
async def api_logs():
    """Return the 30 most recent device state change logs."""
    from .db import get_recent_logs
    return {"logs": await get_recent_logs(30)}


@router.get("/office-hours")
async def api_get_office_hours():
    """Return current office hours configuration."""
    return store.get_office_hours()


@router.post("/office-hours")
async def api_set_office_hours(body: dict):
    """Update office hours at runtime."""
    open_hour = body.get("open_hour")
    close_hour = body.get("close_hour")
    if open_hour is None or close_hour is None:
        raise HTTPException(status_code=400, detail="open_hour and close_hour are required")
    try:
        open_hour = int(open_hour)
        close_hour = int(close_hour)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Hours must be integers")
    if not store.set_office_hours(open_hour, close_hour):
        raise HTTPException(status_code=400, detail="Invalid hours: must be 0-23 and open < close")

    # Re-evaluate alerts immediately — if it's now after hours and devices are on,
    # the user should see alerts right away, not wait for the next simulator tick.
    from .alerts import recheck_alerts
    from .ws import manager as ws_manager
    devices = [d.model_dump() for d in store.get_all_devices()]
    new_alerts = recheck_alerts(devices)
    if new_alerts:
        alert_dicts = [a.model_dump() for a in new_alerts]
        await ws_manager.broadcast({"type": "alerts", "alerts": alert_dicts})
        try:
            from .bot import push_alert
            for alert in new_alerts:
                await push_alert(alert.message)
        except Exception:
            pass

    return {"ok": True, **store.get_office_hours()}


@router.post("/scenario/{scenario_name}")
async def api_scenario(scenario_name: str):
    """Activate a demo scenario or reset to normal."""
    from .simulator import set_scenario, get_scenario, SCENARIOS
    if scenario_name == "status":
        return {"active_scenario": get_scenario(), "available": SCENARIOS}
    if set_scenario(scenario_name):
        # Re-evaluate alerts after scenario change — e.g. "after-hours-forgotten"
        # during actual after-hours should immediately trigger alerts.
        from .alerts import recheck_alerts
        from .ws import manager as ws_manager
        devices = [d.model_dump() for d in store.get_all_devices()]
        new_alerts = recheck_alerts(devices)
        if new_alerts:
            alert_dicts = [a.model_dump() for a in new_alerts]
            await ws_manager.broadcast({"type": "alerts", "alerts": alert_dicts})
            try:
                from .bot import push_alert
                for alert in new_alerts:
                    await push_alert(alert.message)
            except Exception:
                pass
        return {"ok": True, "active_scenario": get_scenario()}
    raise HTTPException(
        status_code=400,
        detail=f"Unknown scenario '{scenario_name}'. Available: {list(SCENARIOS.keys())}",
    )
