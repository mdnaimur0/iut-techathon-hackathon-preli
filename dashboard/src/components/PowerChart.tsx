import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { fetchLogs } from "../api/ws";
import type { ChangeLog } from "../types";
import { LogsPanel } from "./LogsPanel";

interface PowerPoint {
  time: string;
  watts: number;
  date: string;
}

interface ChartDataPoint {
  time: string;
  watts: number;
  avg: number;
}

interface Props {
  currentWatts: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = payload.find((p: any) => p.dataKey === "watts");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const average = payload.find((p: any) => p.dataKey === "avg");
    return (
      <div className="rounded-xl border border-glass-border bg-onyx/95 px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <p className="text-[10px] font-medium text-text-tertiary">{label}</p>
        <div className="mt-1.5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
            <span className="text-xs font-medium text-text-secondary">
              {current?.value ?? 0}W
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-purple" />
            <span className="text-xs font-medium text-text-secondary">
              Avg {average?.value ?? 0}W
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

const STORAGE_KEY_POWER = "powerchart_history";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadHistoryFromStorage(): PowerPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POWER);
    if (!raw) return [];
    const parsed: PowerPoint[] = JSON.parse(raw);
    const today = getTodayKey();
    return parsed.filter((p) => p.date === today);
  } catch {
    return [];
  }
}

function saveHistoryToStorage(data: PowerPoint[]) {
  try {
    localStorage.setItem(STORAGE_KEY_POWER, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function PowerChart({ currentWatts }: Props) {
  const [history, setHistory] = useState<PowerPoint[]>(loadHistoryFromStorage);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadLogs = useCallback(async () => {
    const data = await fetchLogs();
    setLogs(data);
  }, []);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (history.length === 0) return [];
    let sum = 0;
    return history.map((point, i) => {
      sum += point.watts;
      return { ...point, avg: Math.round(sum / (i + 1)) };
    });
  }, [history]);

  const currentAvg =
    chartData.length > 0 ? chartData[chartData.length - 1].avg : 0;

  useEffect(() => {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const date = now.toISOString().slice(0, 10);
    const timeoutId = window.setTimeout(() => {
      setHistory((prev) => {
        const next = [...prev, { time, watts: currentWatts, date }];
        const trimmed = next.length > 30 ? next.slice(-30) : next;
        saveHistoryToStorage(trimmed);
        return trimmed;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentWatts]);

  return (
    <>
      <div className="h-full rounded-4xl bg-glass-bg p-1.5 ring-1 ring-glass-border">
        <div className="card-surface relative flex h-full flex-col overflow-hidden rounded-[1.625rem] bg-onyx p-5">
          <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-accent-emerald-dim blur-3xl" />

          {/* Header */}
          <div className="relative mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              Power Trend
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-full bg-glass-bg px-2.5 py-1 ring-1 ring-glass-border">
                <span className="text-[10px] font-medium text-text-tertiary">
                  Last 30s
                </span>
              </div>
              <button
                onClick={() => {
                  loadLogs();
                  setLogsOpen(!logsOpen);
                }}
                className="group flex h-7 w-7 items-center justify-center rounded-full bg-glass-bg ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:ring-accent-purple/30"
                title="View change logs"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-text-tertiary transition-all duration-500 group-hover:text-accent-purple"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chart */}
          <div ref={containerRef} className="relative flex-1 min-h-50">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#34d399" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <filter id="chartGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: "var(--color-slate-mid)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--color-slate-mid)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 500]}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avg"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill="url(#avgGradient)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="watts"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  isAnimationActive={false}
                  filter="url(#chartGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom stats */}
          <div className="relative mt-3 flex items-center justify-between border-t border-glass-border pt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
                <span className="text-[10px] font-medium text-text-tertiary">
                  Current
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent-purple" />
                <span className="text-[10px] font-medium text-text-tertiary">
                  Average
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-text-tertiary">
                Avg
              </span>
              <span className="text-xs font-bold tabular-nums text-accent-purple">
                {currentAvg}W
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Popup */}
      {logsOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-999 bg-void/40 backdrop-blur-sm rounded-4xl"
              onClick={() => setLogsOpen(false)}
            />
            <div className="fixed top-1/2 -translate-y-1/2 left-1/2 z-1000 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
              <LogsPanel logs={logs} onClose={() => setLogsOpen(false)} />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
