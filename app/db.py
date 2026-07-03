"""SQLite persistence — cumulative kWh tracking + device change logs."""

import aiosqlite
import asyncio
from datetime import datetime, timezone, date
from zoneinfo import ZoneInfo

_local_tz = ZoneInfo("Asia/Dhaka")
_db_path = "usage.db"
_db_lock = asyncio.Lock()
_initialized = False


async def _ensure_db() -> None:
    global _initialized
    if _initialized:
        return
    async with aiosqlite.connect(_db_path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS usage_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                watts INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS change_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                device_name TEXT NOT NULL,
                room TEXT NOT NULL,
                device_type TEXT NOT NULL,
                old_status TEXT NOT NULL,
                new_status TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        await db.commit()
    _initialized = True


async def record_usage(watts: int) -> None:
    """Record a power reading for cumulative kWh tracking."""
    await _ensure_db()
    now = datetime.now(_local_tz)
    today = now.date().isoformat()
    async with _db_lock:
        async with aiosqlite.connect(_db_path) as db:
            await db.execute(
                "INSERT INTO usage_log (date, watts, timestamp) VALUES (?, ?, ?)",
                (today, watts, now.isoformat()),
            )
            await db.commit()


async def get_today_kwh() -> float:
    """Get total kWh consumed today."""
    await _ensure_db()
    today = date.today().isoformat()
    async with _db_lock:
        async with aiosqlite.connect(_db_path) as db:
            cursor = await db.execute(
                "SELECT SUM(watts) FROM usage_log WHERE date = ?", (today,)
            )
            row = await cursor.fetchone()
            total_watt_seconds = row[0] or 0
            # Convert watt-seconds to kWh (divide by 3600)
            return round(total_watt_seconds / 3600, 2)


async def record_change(
    device_id: str,
    device_name: str,
    room: str,
    device_type: str,
    old_status: str,
    new_status: str,
) -> None:
    """Record a device state change to the change_log table."""
    await _ensure_db()
    now = datetime.now(_local_tz)
    async with _db_lock:
        async with aiosqlite.connect(_db_path) as db:
            await db.execute(
                "INSERT INTO change_log (device_id, device_name, room, device_type, old_status, new_status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (device_id, device_name, room, device_type, old_status, new_status, now.isoformat()),
            )
            await db.commit()


async def get_recent_logs(limit: int = 30) -> list[dict]:
    """Return the most recent device state change logs (newest first)."""
    await _ensure_db()
    async with _db_lock:
        async with aiosqlite.connect(_db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT id, device_id, device_name, room, device_type, old_status, new_status, timestamp FROM change_log ORDER BY id DESC LIMIT ?",
                (limit,),
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
