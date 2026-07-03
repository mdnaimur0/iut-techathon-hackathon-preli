# Office Energy Monitor

A real-time office energy monitoring system with a live web dashboard and Discord bot.

## Overview

Monitor all electrical devices (fans and lights) across three office rooms through:
- **Web Dashboard** — live device status, power consumption, and alerts
- **Discord Bot** — ask about office status, room details, and power usage

Both interfaces share a single FastAPI backend as the one source of truth.

## Architecture

```
Devices → FastAPI (simulator + store + API + WS + bot) → Dashboard + Discord → User
```

Everything runs in a single `uvicorn` process: the simulator, in-memory store, alert engine, REST/WebSocket API, served frontend, and Discord bot.

## Setup

### Prerequisites

- Python 3.12+
- Node.js 18+ (for dashboard)
- [uv](https://docs.astral.sh/uv/) (package manager)

### 1. Install dependencies

```bash
uv sync
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings (Discord token, Groq API key, etc.)
```

### 3. Run (development)

```bash
# Terminal 1 — Backend (API + WS + simulator + bot)
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — Dashboard dev server (Vite)
cd dashboard
npm install
npm run dev
```

### 4. Run (single-process demo)

```bash
cd dashboard && npm run build && cd ..
uv run uvicorn app.main:app --port 8000
# Open http://localhost:8000
```

## Discord Bot Commands

| Command | Description |
|:--------|:------------|
| `!status` | Overview of all devices across all rooms |
| `!room <name>` | Detailed status of a specific room |
| `!usage` | Real-time power consumption and daily estimates |

## Environment Variables

See `.env.example` for all configurable options.

## License

MIT
