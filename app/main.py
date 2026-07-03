"""FastAPI application — single-process entry point.

Starts the simulator, Discord bot, REST API, WebSocket, and serves the dashboard.
"""

import asyncio
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from . import routes, services, simulator
from .ws import manager

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup/shutdown of background tasks."""
    sim_task = asyncio.create_task(simulator.run())
    bot_task = None
    try:
        from .bot import start_bot
        bot_task = asyncio.create_task(start_bot())
    except Exception:
        pass
    yield
    sim_task.cancel()
    if bot_task:
        try:
            from .bot import stop_bot
            await stop_bot()
        except Exception:
            pass


app = FastAPI(title="Office Energy Monitor", lifespan=lifespan)

app.include_router(routes.router, prefix="/api")


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    """WebSocket endpoint for real-time state push."""
    await manager.connect(ws)
    # Send current state immediately so the client gets instant data + can
    # derive connection status from the first received message.
    state = services.get_state()
    await ws.send_json({"type": "state", "devices": state})
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)


app.frontend("/", directory="dashboard/dist", check_dir=False)
