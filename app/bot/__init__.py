"""Discord bot — runs in-process via FastAPI lifespan.

Commands:
  !status   — overview of all devices across all rooms
  !room <name> — detailed status of a specific room
  !usage    — real-time power consumption and daily estimates
  !help     — list all commands
  !alert-channel <channel-id> — set the alert channel dynamically
"""

import os
import discord
from discord.ext import commands

from .. import services
from .llm import humanize, humanize_embed

_intents = discord.Intents.default()
_intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=_intents, help_command=None)

_token_hash: str | None = None
_alert_channel_id: str | None = None

# Room display names
ROOM_NAMES = {
    "drawing": "Drawing Room",
    "work1": "Work Room 1",
    "work2": "Work Room 2",
}


@bot.event
async def on_ready():
    global _alert_channel_id
    print(f"[Bot] Logged in as {bot.user} (ID: {bot.user.id})")
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


def _build_status_embed(data: list[dict]) -> discord.Embed:
    """Build a rich embed for the status command."""
    rooms: dict[str, dict] = {}
    for device in data:
        room = device["room"]
        if room not in rooms:
            rooms[room] = {
                "fans_on": 0,
                "lights_on": 0,
                "fans_total": 0,
                "lights_total": 0,
            }
        if device["type"] == "fan":
            rooms[room]["fans_total"] += 1
            if device["status"] == "on":
                rooms[room]["fans_on"] += 1
        else:
            rooms[room]["lights_total"] += 1
            if device["status"] == "on":
                rooms[room]["lights_on"] += 1

    total_on = sum(1 for d in data if d["status"] == "on")
    total = len(data)

    embed = discord.Embed(
        title="Office Device Status",
        description=f"**{total_on}** of **{total}** devices are currently ON",
        color=discord.Color.green() if total_on == 0 else discord.Color.orange(),
    )

    for key in ["drawing", "work1", "work2"]:
        info = rooms.get(key, {})
        fans_on = info.get("fans_on", 0)
        lights_on = info.get("lights_on", 0)
        fans_total = info.get("fans_total", 2)
        lights_total = info.get("lights_total", 3)

        if fans_on == 0 and lights_on == 0:
            status_text = "All off"
            icon = "\u2014"
        else:
            parts = []
            if fans_on > 0:
                parts.append(f"{fans_on}/{fans_total} fans")
            if lights_on > 0:
                parts.append(f"{lights_on}/{lights_total} lights")
            status_text = ", ".join(parts) + " ON"
            icon = "\u26a1"

        embed.add_field(
            name=f"{icon} {ROOM_NAMES.get(key, key)}",
            value=status_text,
            inline=True,
        )

    return embed


def _build_room_embed(data: dict) -> discord.Embed:
    """Build a rich embed for the room command."""
    room_name = data.get("display_name", data.get("room", "Unknown"))
    devices = data.get("devices", [])
    on_devices = [d for d in devices if d["status"] == "on"]

    embed = discord.Embed(
        title=f"{room_name} \u2014 Device Detail",
        color=discord.Color.green() if not on_devices else discord.Color.blue(),
    )

    for d in devices:
        status_icon = "\U0001f7e2" if d["status"] == "on" else "\U0001f534"
        embed.add_field(
            name=f"{status_icon} {d['name']}",
            value=f"{d['type'].capitalize()} \u2022 {d['watts']}W \u2022 **{d['status'].upper()}**",
            inline=True,
        )

    total_watts = sum(d["watts"] for d in on_devices)
    embed.set_footer(text=f"Total draw: {total_watts}W")
    return embed


def _build_usage_embed(data: dict) -> discord.Embed:
    """Build a rich embed for the usage command."""
    total = data.get("total_watts_now", 0)
    per_room = data.get("per_room_watts", {})
    kwh = data.get("today_kwh", 0.0)
    cost = data.get("estimated_daily_cost", 0.0)

    embed = discord.Embed(
        title="Power Consumption",
        color=(
            discord.Color.green()
            if total < 300
            else discord.Color.orange() if total < 450 else discord.Color.red()
        ),
    )

    embed.add_field(name="Current Draw", value=f"**{total}W**", inline=True)
    embed.add_field(name="Today's Usage", value=f"**{kwh} kWh**", inline=True)
    embed.add_field(name="Est. Cost", value=f"**\u09f3{cost:.2f}**", inline=True)

    for key in ["drawing", "work1", "work2"]:
        watts = per_room.get(key, 0)
        embed.add_field(
            name=ROOM_NAMES.get(key, key),
            value=f"{watts}W",
            inline=True,
        )

    return embed


def _build_help_embed() -> discord.Embed:
    """Build a rich embed for the help command."""
    embed = discord.Embed(
        title="Office Energy Monitor \u2014 Commands",
        description="Here's what I can do:",
        color=discord.Color.blurple(),
    )

    commands_list = [
        ("!status", "Overview of all devices across all rooms"),
        ("!room <name>", "Detailed status of a specific room (e.g., `!room work1`)"),
        ("!usage", "Real-time power consumption and daily cost estimates"),
        ("!alert-channel <id>", "Set the channel for proactive alert notifications"),
        ("!help", "Show this help message"),
    ]

    for name, desc in commands_list:
        embed.add_field(name=name, value=desc, inline=False)

    return embed


@bot.command(name="status")
async def status_cmd(ctx: commands.Context):
    """Show current device overview across all rooms."""
    data = services.get_state()
    embed = _build_status_embed(data)
    # Also append the LLM humanized summary as description
    reply = await humanize("status", data)
    embed.description = f"{embed.description}\n\n{reply}"
    await ctx.send(embed=embed)


@bot.command(name="room")
async def room_cmd(ctx: commands.Context, *, name: str):
    """Show detailed status of a specific room."""
    data = services.get_room(name)
    if data is None:
        await ctx.send(
            f"Sorry, I couldn't find a room called '{name}'. Try: drawing, work1, or work2."
        )
        return
    embed = _build_room_embed(data)
    reply = await humanize("room", data)
    embed.set_footer(text=f"{reply}")
    await ctx.send(embed=embed)


@bot.command(name="usage")
async def usage_cmd(ctx: commands.Context):
    """Show real-time power consumption."""
    from .. import store
    from ..db import get_today_kwh

    data = services.get_usage()
    data["today_kwh"] = await get_today_kwh()
    data["estimated_daily_cost"] = round(
        data["today_kwh"] * store.ELECTRICITY_RATE_PER_KWH, 2
    )
    embed = _build_usage_embed(data)
    reply = await humanize("usage", data)
    embed.set_footer(text=f"{reply} \u2022 Office Energy Monitor")
    await ctx.send(embed=embed)


@bot.command(name="help")
async def help_cmd(ctx: commands.Context):
    """Show all available commands."""
    await ctx.send(embed=_build_help_embed())


@bot.command(name="alert-channel")
async def alert_channel_cmd(ctx: commands.Context, channel_id: str):
    """Set the alert channel ID dynamically."""
    global _alert_channel_id
    channel_id = channel_id.strip()
    if not channel_id.isdigit():
        await ctx.send(
            f"Invalid channel ID `{channel_id}`. Must be a numeric Discord snowflake ID."
        )
        return
    channel = bot.get_channel(int(channel_id))
    if channel is None:
        await ctx.send(
            f"I can't access channel `{channel_id}`. Make sure I've been invited to that server/channel."
        )
        return
    from ..db import save_alert_channel

    await save_alert_channel(_token_hash, channel_id)
    _alert_channel_id = channel_id
    await ctx.send(
        f"Alert channel updated to {channel.mention} (`{channel_id}`). Persisted across restarts."
    )


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
    """Post an alert to the designated Discord channel."""
    channel_id = _alert_channel_id
    if channel_id and bot.is_ready():
        try:
            channel = bot.get_channel(int(channel_id))
            if channel:
                embed = discord.Embed(
                    title="Office Alert",
                    description=text,
                    color=discord.Color.red(),
                )
                embed.set_footer(text="Office Energy Monitor")
                await channel.send(embed=embed)
        except Exception:
            pass
