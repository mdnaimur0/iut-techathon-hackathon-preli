import { useEffect, useState, useCallback, useRef } from "react";
import { startWS, subscribeDevices, subscribeAlerts, subscribeConnect, subscribeDisconnect } from "./api/ws";
import type { Device, Alert, Usage } from "./types";
import { DeviceGrid } from "./components/DeviceGrid";
import { PowerMeter } from "./components/PowerMeter";
import { PowerChart } from "./components/PowerChart";
import { FloorPlan } from "./components/FloorPlan";

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [bellPulse, setBellPulse] = useState(false);
  const prevAlertCount = useRef(0);

  const playAlertSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext not available
    }
  }, []);

  const fireNotification = useCallback((alert: Alert) => {
    playAlertSound();
    if (Notification.permission === "granted") {
      new Notification("Office Energy Monitor", {
        body: alert.message,
        icon: "/favicon.svg",
        tag: alert.id,
      });
    }
  }, [playAlertSound]);

  useEffect(() => {
    startWS();

    const unsubDevices = subscribeDevices((devs) => {
      setDevices(devs);
    });

    const unsubAlerts = subscribeAlerts((msg) => {
      setAlerts((prev) => {
        const next = [...msg.alerts, ...prev].slice(0, 50);
        return next;
      });
    });

    const unsubConnect = subscribeConnect(() => {
      setConnected(true);
    });

    const unsubDisconnect = subscribeDisconnect(() => {
      setConnected(false);
    });

    return () => {
      unsubDevices();
      unsubAlerts();
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  // Fire HTML5 notification + bell highlight when new alerts arrive
  useEffect(() => {
    if (alerts.length > prevAlertCount.current && prevAlertCount.current > 0) {
      const newest = alerts[0];
      if (newest) fireNotification(newest);
      setBellPulse(true);
      setTimeout(() => setBellPulse(false), 1200);
    }
    prevAlertCount.current = alerts.length;
  }, [alerts, fireNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
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

  const onCount = devices.filter((d) => d.status === "on").length;

  return (
    <div className="relative min-h-dvh bg-[#030303] text-[#f0f0f5]">
      <div className="mesh-bg" />
      <div className="grain-overlay" />

      {/* Floating Glass Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
        <div
          className="animate-slide-down flex w-full max-w-5xl items-center justify-between rounded-full border border-white/6 bg-[#0e0e11]/80 px-4 py-2.5 backdrop-blur-2xl md:px-6 md:py-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/20 to-purple-500/10 ring-1 ring-emerald-500/20">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-emerald-400/10 blur-md" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold tracking-tight text-[#f0f0f5]">
                Office Energy
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#5a5a6e]">
                Monitor
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tabular-nums text-[#f0f0f5]">
                {totalWatts}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5a5a6e]">
                Watts
              </span>
            </div>
            <div className="h-4 w-px bg-white/6" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tabular-nums text-[#f0f0f5]">
                {onCount}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5a5a6e]">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-white/3 px-3 py-1.5 ring-1 ring-white/4 sm:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-700 ${
                  connected
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : "bg-[#5a5a6e]"
                }`}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5a5a6e]">
                {connected ? "Live" : "Connecting"}
              </span>
            </div>

            {/* Alerts bell icon */}
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/6 transition-all duration-200 hover:bg-white/8 ${
                bellPulse
                  ? "animate-bell-ring bg-red-500/15 ring-red-500/30"
                  : "bg-white/4"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition-colors duration-200 ${
                  bellPulse ? "text-red-400" : "text-[#8e8ea0]"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {alerts.length > 99 ? "99+" : alerts.length}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/4 ring-1 ring-white/6 md:hidden"
            >
              <div className="relative h-3.5 w-3.5">
                <span
                  className={`absolute left-0 h-px w-3.5 bg-[#f0f0f5] transition-all duration-300 ${
                    mobileMenuOpen
                      ? "top-1/2 -translate-y-1/2 rotate-45"
                      : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-px w-3.5 -translate-y-1/2 bg-[#f0f0f5] transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-px w-3.5 bg-[#f0f0f5] transition-all duration-300 ${
                    mobileMenuOpen
                      ? "top-1/2 -translate-y-1/2 -rotate-45"
                      : "bottom-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Alerts Popup */}
      {alertsOpen && (
        <>
          <div
            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
            onClick={() => setAlertsOpen(false)}
          />
          <div className="fixed top-20 left-1/2 z-70 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl bg-[#0e0e11]/95 p-px ring-1 ring-white/6 shadow-2xl backdrop-blur-2xl">
            <div className="overflow-hidden rounded-[calc(1.5rem-1px)]">
              <div className="flex items-center justify-between border-b border-white/4 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 ring-1 ring-red-500/20">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f0f0f5]">Active Alerts</h3>
                </div>
                <button
                  onClick={() => setAlertsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/4 ring-1 ring-white/6 transition-colors hover:bg-white/8"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#5a5a6e]" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[50vh] scroll-smooth overflow-y-auto p-3">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/3 ring-1 ring-white/4">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#3a3a47]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-[#3a3a47]">All clear</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="animate-fade-in-scale group/alert relative overflow-hidden rounded-2xl bg-white/[0.02] p-px ring-1 ring-white/[0.04] transition-all duration-500 hover:ring-white/[0.08]"
                      >
                        <div className="relative rounded-[calc(1rem-1px)] p-3">
                          {/* Severity glow */}
                          <div
                            className={`absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl ${
                              alert.severity === "critical" ? "bg-red-500/10" : "bg-amber-500/10"
                            }`}
                          />

                          <div className="relative flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              {/* Severity icon */}
                              <div
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                                  alert.severity === "critical"
                                    ? "bg-red-500/10 ring-1 ring-red-500/20"
                                    : "bg-amber-500/10 ring-1 ring-amber-500/20"
                                }`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className={`h-3 w-3 ${alert.severity === "critical" ? "text-red-400" : "text-amber-400"}`}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-medium leading-relaxed text-[#8e8ea0]">
                                  {alert.message}
                                </p>
                                <p className="mt-1 text-[9px] font-medium text-[#3a3a47]">
                                  {new Date(alert.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                alert.severity === "critical"
                                  ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                                  : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
                              }`}
                            >
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile menu overlay — always rendered, CSS transition for show/hide */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto bg-[#030303]/90 backdrop-blur-3xl"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="text-5xl font-bold tabular-nums text-[#f0f0f5]">
              {totalWatts}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#5a5a6e]">
              Watts Now
            </span>
          </div>
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="text-5xl font-bold tabular-nums text-[#f0f0f5]">
              {onCount}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#5a5a6e]">
              Devices Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6 md:pt-28 md:pb-20">
        {/* Eyebrow */}
        <div
          className="animate-fade-in-up delay-200 mb-8 md:mb-12 text-center w-content"
        >
          <div className="mb-4 inline-flex items-center justify-center mx-auto gap-2 rounded-full bg-white/3 px-3 py-1 ring-1 ring-white/5">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5a5a6e]">
              Real-time Dashboard
            </span>
          </div>
          <h2 className="text-3xl font-bold w-full text-center tracking-tight text-[#f0f0f5] md:text-4xl lg:text-5xl">
            Energy Overview
          </h2>
        </div>

        {/* SECTION 1: Power Meter + Power Chart (side by side — related data) */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div
            className="animate-fade-in-up delay-300 lg:col-span-1"
          >
            <PowerMeter usage={usage} />
          </div>
          <div
            className="animate-fade-in-up delay-400 lg:col-span-2"
          >
            <PowerChart currentWatts={totalWatts} />
          </div>
        </div>

        {/* SECTION 2: Device Grid (full width) */}
        <div
          className="animate-fade-in-up delay-500 mb-6"
        >
          <DeviceGrid devices={devices} />
        </div>

        {/* SECTION 3: Floor Plan (full width) */}
        <div
          className="animate-fade-in-up delay-600"
        >
          <FloorPlan devices={devices} />
        </div>
      </main>
    </div>
  );
}

export default App;
