"""Groq LLM client with templated fallback for humanizing bot responses."""

import os

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            try:
                from groq import Groq
                _client = Groq(api_key=api_key)
            except Exception:
                _client = False
        else:
            _client = False
    return _client if _client is not False else None


async def humanize(command: str, data: dict | list) -> str:
    """Convert raw data into a friendly, conversational response."""
    client = _get_client()
    if client is None:
        return _template_fallback(command, data)

    prompt = _build_prompt(command, data)
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a friendly office assistant bot. Reply in a casual, helpful tone. Keep responses concise (2-4 sentences max). Do not use markdown formatting."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=200,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return _template_fallback(command, data)


def _build_prompt(command: str, data: dict | list) -> str:
    if command == "status":
        return f"Here's the current device status across all rooms: {data}. Summarize this in a friendly way, mentioning which rooms have devices on."
    elif command == "room":
        return f"Here's the detailed status for a room: {data}. Describe the room's current state in a conversational way."
    elif command == "usage":
        return f"Here's the current power usage: {data}. Explain this in a friendly way, mentioning total watts and today's kWh."
    return f"Here's the data: {data}. Summarize this briefly."


def _template_fallback(command: str, data: dict | list) -> str:
    """Generate a response without LLM when no API key is available."""
    if command == "status":
        rooms: dict[str, dict] = {}
        for device in data:
            room = device["room"]
            if room not in rooms:
                rooms[room] = {"fans_on": 0, "lights_on": 0, "total": 0}
            if device["status"] == "on":
                rooms[room]["total"] += 1
                if device["type"] == "fan":
                    rooms[room]["fans_on"] += 1
                else:
                    rooms[room]["lights_on"] += 1

        room_names = {"drawing": "Drawing Room", "work1": "Work Room 1", "work2": "Work Room 2"}
        parts = []
        for key, info in rooms.items():
            name = room_names.get(key, key)
            if info["total"] == 0:
                parts.append(f"{name}: all off")
            else:
                items = []
                if info["fans_on"] > 0:
                    items.append(f"{info['fans_on']} fan{'s' if info['fans_on'] > 1 else ''} ON")
                if info["lights_on"] > 0:
                    items.append(f"{info['lights_on']} light{'s' if info['lights_on'] > 1 else ''} ON")
                parts.append(f"{name}: {', '.join(items)}")
        return " | ".join(parts)

    elif command == "room":
        room_name = data.get("display_name", data.get("room", "Unknown"))
        devices = data.get("devices", [])
        on_devices = [d for d in devices if d["status"] == "on"]
        off_devices = [d for d in devices if d["status"] == "off"]

        if not on_devices:
            return f"All devices in {room_name} are off. Nothing's running right now."
        items = []
        for d in on_devices:
            items.append(f"{d['name']} ({d['watts']}W)")
        return f"In {room_name}, {len(on_devices)} device{'s' if len(on_devices) > 1 else ''} running: {', '.join(items)}. {len(off_devices)} device{'s' if len(off_devices) > 1 else ''} off."

    elif command == "usage":
        total = data.get("total_watts_now", 0)
        per_room = data.get("per_room_watts", {})
        room_names = {"drawing": "Drawing Room", "work1": "Work Room 1", "work2": "Work Room 2"}
        parts = [f"Total power right now: {total}W"]
        for room, watts in per_room.items():
            parts.append(f"{room_names.get(room, room)}: {watts}W")
        return ". ".join(parts) + "."

    return str(data)
