import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  startWS,
  subscribeDevices,
  subscribeAlerts,
  subscribeConnect,
  subscribeDisconnect,
} from "./api/ws";
import type { Device, Alert, Usage } from "./types";
import { DeviceGrid } from "./components/DeviceGrid";
import { PowerMeter } from "./components/PowerMeter";
import { PowerChart } from "./components/PowerChart";
import { FloorPlan } from "./components/FloorPlan";
import { ThemeToggle } from "./components/ThemeToggle";
import { AlertsPanel } from "./components/AlertsPanel";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [bellPulse, setBellPulse] = useState(false);
  const prevAlertCount = useRef(0);

  const heroRef = useInView(0.1);
  const section1Ref = useInView(0.1);
  const section2Ref = useInView(0.1);
  const section3Ref = useInView(0.1);

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

  const fireNotification = useCallback(
    (alert: Alert) => {
      playAlertSound();
      if (Notification.permission === "granted") {
        new Notification("Office Energy Monitor", {
          body: alert.message,
          icon: "/favicon.svg",
          tag: alert.id,
        });
      }
    },
    [playAlertSound],
  );

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

  useEffect(() => {
    if (alerts.length > prevAlertCount.current && prevAlertCount.current > 0) {
      const newest = alerts[0];
      if (newest) fireNotification(newest);
      setBellPulse(true);
      setTimeout(() => setBellPulse(false), 1200);
    }
    prevAlertCount.current = alerts.length;
  }, [alerts, fireNotification]);

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
    <div className="relative min-h-dvh bg-void text-text-primary">
      <div className="mesh-bg" />
      <div className="grain-overlay" />

      {/* Floating Glass Island Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
        <div className="animate-slide-down flex w-full max-w-5xl items-center justify-between rounded-full border border-glass-border bg-onyx/80 px-4 py-2.5 backdrop-blur-2xl md:px-6 md:py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-accent-emerald-dim to-accent-purple-dim ring-1 ring-accent-emerald/20">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-accent-emerald/10 blur-md" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold tracking-tight text-text-primary">
                Office Energy
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-text-tertiary">
                Monitor
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tabular-nums text-text-primary">
                {totalWatts}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                Watts
              </span>
            </div>
            <div className="h-4 w-px bg-glass-border" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tabular-nums text-text-primary">
                {onCount}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden items-center gap-2 rounded-full bg-glass-bg px-3 py-1.5 ring-1 ring-glass-border sm:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-700 ${
                  connected
                    ? "bg-accent-emerald shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : "bg-slate-mid"
                }`}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                {connected ? "Live" : "Connecting"}
              </span>
            </div>

            {/* Alerts bell */}
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className={`group relative flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:ring-accent-red/30 ${
                bellPulse
                  ? "animate-bell-ring bg-accent-red-dim ring-accent-red/30"
                  : "bg-glass-bg"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition-all duration-500 group-hover:scale-110 ${
                  bellPulse ? "text-accent-red" : "text-text-secondary"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white">
                  {alerts.length > 99 ? "99+" : alerts.length}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="group flex h-8 w-8 items-center justify-center rounded-full bg-glass-bg ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] md:hidden"
            >
              <div className="relative h-3.5 w-3.5">
                <span
                  className={`absolute left-0 h-px w-3.5 bg-text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    mobileMenuOpen
                      ? "top-1/2 -translate-y-1/2 rotate-45"
                      : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-px w-3.5 -translate-y-1/2 bg-text-primary transition-all duration-500 ${
                    mobileMenuOpen
                      ? "opacity-0 scale-0"
                      : "opacity-100 scale-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-px w-3.5 bg-text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
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

      {alertsOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-60 bg-void/60 backdrop-blur-sm"
            onClick={() => setAlertsOpen(false)}
          />
          <div className="fixed top-20 inset-x-0 z-70 mx-auto w-[calc(100%-2rem)] max-w-md">
            <AlertsPanel alerts={alerts} onClose={() => setAlertsOpen(false)} />
          </div>
        </>,
        document.body
      )}

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto bg-void/90 backdrop-blur-3xl"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              mobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="text-5xl font-bold tabular-nums text-text-primary">
              {totalWatts}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
              Watts Now
            </span>
          </div>
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              mobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="text-5xl font-bold tabular-nums text-text-primary">
              {onCount}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
              Devices Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6 md:pt-28 md:pb-20">
        {/* Eyebrow */}
        <div ref={heroRef} className="reveal mb-8 md:mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-glass-bg px-3 py-1 ring-1 ring-glass-border">
            <span className="h-1 w-1 rounded-full bg-accent-emerald" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              Real-time Dashboard
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl lg:text-5xl">
            Energy Overview
          </h2>
        </div>

        {/* SECTION 1: Power Meter + Power Chart */}
        <div
          ref={section1Ref}
          className="reveal mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3"
        >
          <div className="lg:col-span-1">
            <PowerMeter usage={usage} />
          </div>
          <div className="lg:col-span-2">
            <PowerChart currentWatts={totalWatts} />
          </div>
        </div>

        {/* SECTION 2: Device Grid */}
        <div ref={section2Ref} className="reveal mb-6">
          <DeviceGrid devices={devices} />
        </div>

        {/* SECTION 3: Floor Plan */}
        <div ref={section3Ref} className="reveal">
          <FloorPlan devices={devices} />
        </div>
      </main>
    </div>
  );
}

export default App;
