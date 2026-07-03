# Office Energy Monitor

> "Lights, Fans, Discord: The Boss's Big Idea"

A real-time office energy monitoring system with a live web dashboard and Discord bot. Monitor all 15 electrical devices (fans and lights) across 3 office rooms through both a web interface and Discord commands.

## Architecture

Everything runs in a **single FastAPI process** — the simulator, in-memory store, alert engine, REST/WebSocket API, served frontend, and Discord bot.

```
Devices → FastAPI (simulator + store + API + WS + bot) → Dashboard + Discord → User
```

![System Diagram](docs/system-diagram.svg)

## Features

### Web Dashboard
- **Live Device Status Grid** — 15 devices grouped by room with real-time on/off indicators
- **Power Consumption Meter** — total office watts + per-room breakdown + daily kWh
- **Interactive Floor Plan** — SVG top-view with animated fans (spin) and glowing lights
- **Power Trend Chart** — real-time line chart of power consumption over time
- **Active Alerts Panel** — timestamped after-hours and room-on-2h warnings

### Discord Bot
| Command | Description |
|:--------|:------------|
| `!status` | Overview of all devices across all rooms |
| `!room <name>` | Detailed breakdown of a specific room |
| `!usage` | Real-time power consumption and daily estimates |

- Humanized, conversational replies via Groq LLM (with fallback if no API key)
- Proactive alert posting to a designated Discord channel

### Hardware Schematic
- Wokwi-compatible ESP32 circuit modeling one room
- 3 LEDs (lights), 2 servos (fans), 5 slide switches, ACS712 current sensor
- Firmware outputs JSON matching the software simulator's device shape

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Backend | Python + FastAPI + uvicorn |
| Real-time | Native WebSockets |
| State | In-memory dict (Pydantic models) |
| Persistence | SQLite (cumulative kWh) |
| Frontend | React + Vite + TypeScript |
| Styling | TailwindCSS v4 |
| Animations | Framer Motion + CSS |
| Charts | Recharts |
| Bot | discord.py (in-process) |
| LLM | Groq (Llama 3.x) with templated fallback |
| Circuit | Wokwi (ESP32) |
| Diagram | SVG |

## Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- pnpm or npm

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd techathon-hackathon-preli

# Python dependencies
uv sync

# Dashboard dependencies
cd dashboard
pnpm install
cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Backend / simulation
ELECTRICITY_RATE_PER_KWH=8.0     # currency per kWh
OFFICE_OPEN_HOUR=9
OFFICE_CLOSE_HOUR=17

# Discord bot (leave blank to disable)
DISCORD_TOKEN=your-bot-token
ALERT_CHANNEL_ID=123456789012345678
GROQ_API_KEY=your-groq-key        # optional; falls back to templated replies
```

### 3. Run in development (two terminals)

```bash
# Terminal 1 — Backend (API + WS + simulator + bot)
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — Dashboard dev server
cd dashboard
pnpm run dev
```

Open http://localhost:5173 (Vite default) — the dev server proxies `/api` and `/ws` to the backend.

### 4. Run as single-process demo

```bash
cd dashboard && pnpm run build && cd ..
uv run uvicorn app.main:app --port 8000
```

Open http://localhost:8000 — dashboard + API + WebSocket + Discord bot, all in one process.

## Project Structure

```
techathon-hackathon-preli/
├── pyproject.toml           # uv-managed dependencies
├── uv.lock                  # lockfile
├── .python-version          # Python 3.12
├── .env.example             # environment variables template
├── app/                     # FastAPI application package
│   ├── main.py              # app entry point, lifespan, routes
│   ├── store.py             # in-memory source of truth (15 devices)
│   ├── services.py          # shared read logic (API + bot)
│   ├── simulator.py         # asyncio state mutation loop
│   ├── alerts.py            # after-hours / room-on-2h engine
│   ├── ws.py                # WebSocket connection manager
│   ├── routes.py            # REST API endpoints
│   ├── db.py                # SQLite cumulative kWh
│   ├── models.py            # Pydantic models (Device, Alert, Usage)
│   └── bot/
│       ├── __init__.py      # discord.py bot, commands, start/stop
│       └── llm.py           # Groq client + templated fallback
├── dashboard/               # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── api/ws.ts        # reconnecting WebSocket client
│   │   ├── components/      # DeviceGrid, PowerMeter, AlertsPanel, FloorPlan, PowerChart
│   │   ├── types.ts         # TypeScript types mirroring backend models
│   │   └── App.tsx          # main dashboard layout
│   ├── index.html
│   └── vite.config.ts       # dev proxy to FastAPI
├── hardware/
│   ├── diagram.json         # Wokwi ESP32 circuit
│   ├── sketch.ino           # ESP32 firmware
│   └── README.md            # wiring explanation
├── docs/
│   └── system-diagram.svg   # architecture diagram
└── README.md
```

## Data Model

The office has 3 rooms × 5 devices = **15 devices total**.

| Room | Fans | Lights | Total |
|:-----|:----:|:------:|:-----:|
| Drawing Room | 2 | 3 | 5 |
| Work Room 1 | 2 | 3 | 5 |
| Work Room 2 | 2 | 3 | 5 |

Power consumption: Fan ON = 60W, Light ON = 15W. Max office capacity = 495W.

## License

MIT
