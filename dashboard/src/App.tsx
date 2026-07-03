import { useEffect, useState } from "react";
import { startWS, subscribeDevices, subscribeAlerts } from "./api/ws";
import type { Device, Alert, Usage } from "./types";
import { DeviceGrid } from "./components/DeviceGrid";
import { PowerMeter } from "./components/PowerMeter";
import { PowerChart } from "./components/PowerChart";
import { AlertsPanel } from "./components/AlertsPanel";
import { FloorPlan } from "./components/FloorPlan";

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    startWS();

    const unsubDevices = subscribeDevices((devs) => {
      setDevices(devs);
      setConnected(true);
    });

    const unsubAlerts = subscribeAlerts((msg) => {
      setAlerts((prev) => [...msg.alerts, ...prev].slice(0, 50));
    });

    return () => {
      unsubDevices();
      unsubAlerts();
    };
  }, []);

  const totalWatts = devices
    .filter((d) => d.status === "on")
    .reduce((sum, d) => sum + d.watts, 0);

  const perRoomWatts: Record<string, number> = {};
  for (const d of devices) {
    if (d.status === "on") {
      perRoomWatts[d.room] = (perRoomWatts[d.room] ?? 0) + d.watts;
    }
  }

  const usage: Usage = {
    total_watts_now: totalWatts,
    per_room_watts: perRoomWatts,
    today_kwh: 0,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">Office Energy Monitor</h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-red-400"
              }`}
            />
            <span className="text-xs text-zinc-500">
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <DeviceGrid devices={devices} />
          </div>
          <div className="space-y-6">
            <PowerMeter usage={usage} />
            <AlertsPanel alerts={alerts} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FloorPlan devices={devices} />
          <PowerChart currentWatts={totalWatts} />
        </div>
      </main>
    </div>
  );
}

export default App;
