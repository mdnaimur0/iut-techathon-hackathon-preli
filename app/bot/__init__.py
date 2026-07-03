"""Discord bot — runs in-process via FastAPI lifespan.

Commands:
  !status  — overview of all devices across all rooms
  !room <name> — detailed status of a specific room
  !usage — real-time power consumption and daily estimates
  !alert-channel <channel-id> — set the alert channel dynamically
"""

import os
import discord
from discord.ext import commands

from .. import services
from .llm import humanize

_intents = discord.Intents.default()
_intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=_intents)

_token_hash: str | None = None
_alert_channel_id: str | None = None


@bot.event
async def on_ready():
    global _alert_channel_id
    print(f"[Bot] Logged in as {bot.user} (ID: {bot.user.id})")
    # Load persisted alert channel from DB (if any)
    if _token_hash:
        from ..db import get_alert_channel
        stored = await get_alert_channel(_token_hash)
        if stored:
            _alert_channel_id = stored
            print(f"[Bot] Loaded alert channel from DB: {_alert_channel_id}")
        else:
            _alert_channel_id = os.getenv("ALERT_CHANNEL_ID") or None
            if _alert_channel_id:
                print(f"[Bot] Using alert channel from env: {_alert_channel_id}")


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


@bot.command(name="alert-channel")
async def alert_channel_cmd(ctx: commands.Context, channel_id: str):
    """Set the alert channel ID dynamically. Overrides the env var for this bot instance."""
    global _alert_channel_id
    channel_id = channel_id.strip()
    # Validate it's a numeric snowflake
    if not channel_id.isdigit():
        await ctx.send(f"Invalid channel ID `{channel_id}`. Must be a numeric Discord snowflake ID.")
        return
    # Verify the bot can actually see this channel
    channel = bot.get_channel(int(channel_id))
    if channel is None:
        await ctx.send(f"I can't access channel `{channel_id}`. Make sure I've been invited to that server/channel.")
        return
    # Persist to DB
    from ..db import save_alert_channel
    await save_alert_channel(_token_hash, channel_id)
    _alert_channel_id = channel_id
    await ctx.send(f"Alert channel updated to {channel.mention} (`{channel_id}`). Persisted across restarts.")


async def start_bot():
    """Start the Discord bot. No-ops if DISCORD_TOKEN is not set."""
    global _token_hash, _alert_channel_id
    token = os.getenv("DISCORD_TOKEN")
    if token:
        from ..db import hash_token
        _token_hash = hash_token(token)
        _alert_channel_id = os.getenv("ALERT_CHANNEL_ID") or None
        await bot.start(token)
    else:
        print("[Bot] No DISCORD_TOKEN set — bot disabled, dashboard still runs.")


async def stop_bot():
    """Gracefully close the bot connection."""
    if not bot.is_closed():
        await bot.close()


async def push_alert(text: str):
    """Post an alert to the designated Discord channel (called by alerts.py).

    Resolution order:
      1. Channel set via !alert-channel command (stored in DB)
      2. ALERT_CHANNEL_ID env var
      3. Skip if neither is set
    """
    channel_id = _alert_channel_id
    if channel_id and bot.is_ready():
        try:
            channel = bot.get_channel(int(channel_id))
            if channel:
                await channel.send(f"⚠️ {text}")
        except Exception:
            pass
