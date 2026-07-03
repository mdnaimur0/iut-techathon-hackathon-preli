"""Discord bot — runs in-process via FastAPI lifespan.

Commands:
  !status  — overview of all devices across all rooms
  !room <name> — detailed status of a specific room
  !usage — real-time power consumption and daily estimates
"""

import os
import discord
from discord.ext import commands

from .. import services
from .llm import humanize

_intents = discord.Intents.default()
_intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=_intents)


@bot.event
async def on_ready():
    print(f"[Bot] Logged in as {bot.user} (ID: {bot.user.id})")


@bot.command(name="status")
async def status_cmd(ctx: commands.Context):
    """Show current device overview across all rooms."""
    data = services.get_state()
    reply = await humanize("status", data)
    await ctx.send(reply)


@bot.command(name="room")
async def room_cmd(ctx: commands.Context, *, name: str):
    """Show detailed status of a specific room."""
    data = services.get_room(name)
    if data is None:
        await ctx.send(f"Sorry, I couldn't find a room called '{name}'. Try: drawing, work1, or work2.")
        return
    reply = await humanize("room", data)
    await ctx.send(reply)


@bot.command(name="usage")
async def usage_cmd(ctx: commands.Context):
    """Show real-time power consumption."""
    data = services.get_usage()
    try:
        from ..db import get_today_kwh
        data["today_kwh"] = await get_today_kwh()
    except Exception:
        data["today_kwh"] = 0.0
    reply = await humanize("usage", data)
    await ctx.send(reply)


async def start_bot():
    """Start the Discord bot. No-ops if DISCORD_TOKEN is not set."""
    token = os.getenv("DISCORD_TOKEN")
    if token:
        await bot.start(token)
    else:
        print("[Bot] No DISCORD_TOKEN set — bot disabled, dashboard still runs.")


async def stop_bot():
    """Gracefully close the bot connection."""
    if not bot.is_closed():
        await bot.close()


async def push_alert(text: str):
    """Post an alert to the designated Discord channel (called by alerts.py)."""
    channel_id = os.getenv("ALERT_CHANNEL_ID")
    if channel_id and bot.is_ready():
        try:
            channel = bot.get_channel(int(channel_id))
            if channel:
                await channel.send(f"⚠️ {text}")
        except Exception:
            pass
