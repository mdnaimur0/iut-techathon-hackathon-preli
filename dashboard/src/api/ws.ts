import type { Device, ChangeLog, WSMessage } from "../types";

type Listener = (devices: Device[], todayKwh: number, activeScenario: string | null) => void;
type AlertListener = (alerts: WSMessage & { type: "alerts" }) => void;
type ConnectListener = () => void;
type LastUpdateListener = (timestamp: number) => void;

let ws: WebSocket | null = null;
const deviceListeners: Listener[] = [];
const alertListeners: AlertListener[] = [];
const connectListeners: ConnectListener[] = [];
const disconnectListeners: ConnectListener[] = [];
const lastUpdateListeners: LastUpdateListener[] = [];
let latestDevices: Device[] = [];
let latestTodayKwh: number = 0;
let latestScenario: string | null = null;
let lastUpdateTime: number = 0;

function getWsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  ws = new WebSocket(getWsUrl());

  ws.onopen = () => {
    console.log("[WS] Connected");
    connectListeners.forEach((fn) => fn());
  };

  ws.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);
      if (msg.type === "state") {
        latestDevices = msg.devices;
        if (msg.today_kwh !== undefined) {
          latestTodayKwh = msg.today_kwh;
        }
        if (msg.active_scenario !== undefined) {
          latestScenario = msg.active_scenario;
        }
        lastUpdateTime = Date.now();
        lastUpdateListeners.forEach((fn) => fn(lastUpdateTime));
        deviceListeners.forEach((fn) => fn(msg.devices, latestTodayKwh, latestScenario));
      } else if (msg.type === "alerts") {
        alertListeners.forEach((fn) => fn(msg));
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    console.log("[WS] Disconnected, reconnecting in 2s...");
    disconnectListeners.forEach((fn) => fn());
    setTimeout(connect, 2000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function startWS() {
  connect();
}

export function subscribeDevices(fn: Listener): () => void {
  deviceListeners.push(fn);
  return () => {
    const idx = deviceListeners.indexOf(fn);
    if (idx >= 0) deviceListeners.splice(idx, 1);
  };
}

export function subscribeAlerts(fn: AlertListener): () => void {
  alertListeners.push(fn);
  return () => {
    const idx = alertListeners.indexOf(fn);
    if (idx >= 0) alertListeners.splice(idx, 1);
  };
}

export function subscribeConnect(fn: ConnectListener): () => void {
  connectListeners.push(fn);
  return () => {
    const idx = connectListeners.indexOf(fn);
    if (idx >= 0) connectListeners.splice(idx, 1);
  };
}

export function subscribeDisconnect(fn: ConnectListener): () => void {
  disconnectListeners.push(fn);
  return () => {
    const idx = disconnectListeners.indexOf(fn);
    if (idx >= 0) disconnectListeners.splice(idx, 1);
  };
}

export function subscribeLastUpdate(fn: LastUpdateListener): () => void {
  lastUpdateListeners.push(fn);
  return () => {
    const idx = lastUpdateListeners.indexOf(fn);
    if (idx >= 0) lastUpdateListeners.splice(idx, 1);
  };
}

export function getLastUpdateTime(): number {
  return lastUpdateTime;
}

export function getLatestDevices(): Device[] {
  return latestDevices;
}

export async function fetchLogs(): Promise<ChangeLog[]> {
  try {
    const res = await fetch("/api/logs");
    const data = await res.json();
    return data.logs ?? [];
  } catch {
    return [];
  }
}

export async function triggerScenario(name: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/scenario/${name}`, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchOfficeHours(): Promise<{ open_hour: number; close_hour: number; rate_per_kwh: number } | null> {
  try {
    const res = await fetch("/api/office-hours");
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateOfficeHours(open_hour: number, close_hour: number): Promise<boolean> {
  try {
    const res = await fetch("/api/office-hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ open_hour, close_hour }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
