import type { Device, WSMessage } from "../types";

type Listener = (devices: Device[]) => void;
type AlertListener = (alerts: WSMessage & { type: "alerts" }) => void;

let ws: WebSocket | null = null;
const listeners: Listener[] = [];
const alertListeners: AlertListener[] = [];
let latestDevices: Device[] = [];

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
  };

  ws.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);
      if (msg.type === "state") {
        latestDevices = msg.devices;
        listeners.forEach((fn) => fn(msg.devices));
      } else if (msg.type === "alerts") {
        alertListeners.forEach((fn) => fn(msg));
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    console.log("[WS] Disconnected, reconnecting in 2s...");
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
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function subscribeAlerts(fn: AlertListener): () => void {
  alertListeners.push(fn);
  return () => {
    const idx = alertListeners.indexOf(fn);
    if (idx >= 0) alertListeners.splice(idx, 1);
  };
}

export function getLatestDevices(): Device[] {
  return latestDevices;
}
