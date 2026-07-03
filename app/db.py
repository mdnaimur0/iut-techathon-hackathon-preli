"""SQLite accumulator for cumulative kWh tracking."""

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
