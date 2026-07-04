# Office Energy Monitor — Dashboard

A real-time React dashboard for monitoring 15 electrical devices (fans and lights) across 3 office rooms. Live device status, power consumption, interactive floor plan, alerts, and demo scenario control — all updates arrive via WebSocket with zero page refresh.

## Tech Stack

| Layer          | Technology    | Version |
| :------------- | :------------ | :------ |
| Framework      | React         | 19.2    |
| Language       | TypeScript    | 6.0     |
| Build          | Vite          | 8.1     |
| Styling        | TailwindCSS   | 4.3     |
| Animations     | Framer Motion | 12.42   |
| Charts         | Recharts      | 3.9     |
| React Compiler | Babel plugin  | 1.0     |

## Quick Start

```bash
# From the project root
cd dashboard
pnpm install
pnpm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api` and `/ws` to the FastAPI backend at `http://localhost:8000`.

### Build for Production

```bash
pnpm run build    # outputs to dist/
pnpm run preview  # preview the build locally
```

The built `dist/` folder is served by FastAPI when running the single-process demo:

```bash
# From project root
cd dashboard && pnpm run build && cd ..
uv run uvicorn app.main:app --port 8000
# Open http://localhost:8000
```

## Features

### Live Device Grid

3-column room layout (Drawing Room, Work Room 1, Work Room 2). Each room shows an ON count badge and color accent. Individual device cards display fan/light icon (animated when ON), name, wattage, and last-changed timestamp.

### Power Meter & Chart

Radial SVG gauge showing total watts as a percentage of max capacity (495W). Per-room horizontal breakdown bars. Rolling 30-point area chart with current watts (green) and running average (purple dashed). Daily kWh and estimated cost in BDT.

### Interactive Floor Plan

Hand-crafted ~970-line SVG top-view of the office. Three rooms, hallway, doors, windows, desks, plants, water dispenser. Fans rotate with SMIL animation when ON. Lights pulse with glowing opacity. Doors show as open arcs when the office is active.

### Alerts Panel

Portal-based overlay showing timestamped alerts with severity badges (WARNING / CRITICAL). Two alert rules: after-hours detection (devices on outside 9 AM – 5 PM) and room-on-2h (all devices on for 2+ hours). Browser notifications + audio beep on new alerts.

### Demo Scenario Control

Fixed FAB (bottom-right) opens a popup with 5 preset scenarios:

- **Normal** — random simulation
- **All On** — every device ON (max power)
- **All Off** — every device OFF (energy saver)
- **Lunch Break** — work rooms OFF, drawing room ON
- **After Hours** — triggers alert system

Office hours are configurable at runtime via the dashboard.

### Dark / Light Theme

Toggle button in the navbar. Theme persists to `localStorage`. Full CSS custom property system for seamless switching.

## Project Structure

```
dashboard/
├── index.html                    # SPA entry point (Plus Jakarta Sans font)
├── package.json                  # dependencies and scripts
├── vite.config.ts                # Vite config with dev proxy to FastAPI
├── public/
│   └── favicon.svg               # SVG bolt icon
├── dist/                         # built production output (served by FastAPI)
└── src/
    ├── main.tsx                  # React root with ThemeProvider
    ├── App.tsx                   # main layout — all sections composed here
    ├── types.ts                  # TypeScript types mirroring backend models
    ├── context/
    │   └── ThemeContext.tsx       # dark/light theme with localStorage
    ├── styles/
    │   └── global.css            # TailwindCSS v4 config + custom animations
    ├── api/
    │   └── ws.ts                 # reconnecting WebSocket client + pub/sub
    └── components/
        ├── DeviceGrid.tsx        # 3-column room grid with device cards
        ├── DeviceCard.tsx        # individual device (fan/light, on/off, watts)
        ├── PowerMeter.tsx        # radial gauge + per-room bars + kWh + cost
        ├── PowerChart.tsx        # Recharts area chart with rolling history
        ├── FloorPlan.tsx         # full SVG office layout with live devices
        ├── AlertsPanel.tsx       # portal-based alert overlay
        ├── LogsPanel.tsx         # device state change history table
        ├── DemoControl.tsx       # FAB popup for scenarios + office hours
        └── ThemeToggle.tsx       # dark/light toggle button
```

## Component Overview

| Component         | Description                                                                                                               |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `App.tsx`         | Root layout. Subscribes to WebSocket, computes derived state (totalWatts, perRoomWatts, usage), composes all sections.    |
| `DeviceGrid.tsx`  | Groups devices by room in a 3-column grid. Color-coded accents per room.                                                  |
| `DeviceCard.tsx`  | Single device card. Fan spins when ON (CSS animation). Light glows. Shows name, type, watts, last changed.                |
| `PowerMeter.tsx`  | Radial SVG gauge (0–495W). Stats row: capacity %, today's kWh, cost in BDT. Per-room horizontal bars.                     |
| `PowerChart.tsx`  | Recharts `AreaChart` with 30-point rolling history stored in `localStorage`. Current watts + running average.             |
| `FloorPlan.tsx`   | ~970-line SVG. Rooms, furniture, doors, windows. SMIL animations for fans and lights. Theme-aware via CSS vars.           |
| `AlertsPanel.tsx` | Portal overlay. Alert cards with severity badges, timestamps. Clear all button. Auto-persists to `localStorage` (1 hour). |
| `LogsPanel.tsx`   | Table of device state changes. Auto-refreshes every 15 seconds from `/api/logs`.                                          |
| `DemoControl.tsx` | Fixed-position FAB. Popup with 5 scenario buttons + office hours dropdowns.                                               |
| `ThemeToggle.tsx` | Moon/sun icon toggle. Uses `ThemeContext` to switch and persist.                                                          |

## WebSocket Protocol

The dashboard connects to `ws://{host}/ws` and receives JSON messages:

### State Update (`type: "state"`)

```json
{
  "type": "state",
  "devices": [
    {
      "id": "drawing-fan-1",
      "name": "Fan 1",
      "type": "fan",
      "room": "drawing",
      "status": "on",
      "watts": 60,
      "last_changed": "2026-07-04T12:30:00+06:00"
    }
  ],
  "today_kwh": 4.2,
  "active_scenario": null
}
```

### Alert Update (`type: "alerts"`)

```json
{
  "type": "alerts",
  "alerts": [
    {
      "id": "alert-1",
      "severity": "warning",
      "message": "Work Room 2: 2 fans ON, 3 lights ON after hours",
      "room": "work2",
      "created_at": "2026-07-04T18:00:00+06:00"
    }
  ]
}
```

## State Management

- **Device state**: received via WebSocket, stored in React `useState`
- **Alert history**: persisted to `localStorage` (1-hour TTL)
- **Power chart**: rolling 30-point history in `localStorage` (per-day key)
- **Theme**: persisted to `localStorage` via `ThemeContext`
- **Connection status**: tracked via `subscribeConnect` / `subscribeDisconnect`

## Styling

TailwindCSS v4 with a full dark/light theme system defined in `global.css`:

- **Dark mode** (default): void-black backgrounds, emerald/purple/amber accents, glass-morphism cards
- **Light mode**: white/cream backgrounds, muted accents, elevated surfaces with inner shadows
- **Floor plan tokens**: 70+ CSS custom properties for SVG colors
- **Custom animations**: `pulse-glow`, `float`, `shimmer`, `bell-ring`, `fade-in-up`, `slide-down`, `count-pulse`
- **Scroll reveal**: IntersectionObserver-based `.reveal` → `.visible` system
- **Grain overlay**: SVG noise texture at fixed `pointer-events: none`
- **Mesh background**: 3 radial gradients for depth

## Scripts

```bash
pnpm run dev      # start Vite dev server with HMR
pnpm run build    # type-check + production build
pnpm run lint     # run ESLint
pnpm run preview  # preview production build locally
```
