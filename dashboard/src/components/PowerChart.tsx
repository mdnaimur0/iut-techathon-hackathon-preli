import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef, useMemo } from "react";

interface PowerPoint {
  time: string;
  watts: number;
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
      <div className="rounded-xl border border-glass-border bg-onyx/95 px-3 py-2">
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

export function PowerChart({ currentWatts }: Props) {
  const [history, setHistory] = useState<PowerPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const timeoutId = window.setTimeout(() => {
      setHistory((prev) => {
        const next = [...prev, { time: now, watts: currentWatts }];
        return next.length > 30 ? next.slice(-30) : next;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentWatts]);

  return (
    <div className="h-full rounded-4xl bg-glass-bg p-1.5 ring-1 ring-glass-border">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1.625rem] bg-onyx p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-accent-emerald-dim blur-3xl" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Power Trend
          </h3>
          <div className="flex items-center gap-1.5 rounded-full bg-glass-bg px-2.5 py-1 ring-1 ring-glass-border">
            <span className="text-[10px] font-medium text-text-tertiary">
              Last 30s
            </span>
          </div>
        </div>

        {/* Chart */}
        <div ref={containerRef} className="relative flex-1 min-h-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
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
  );
}
