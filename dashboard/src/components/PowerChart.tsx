import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef } from "react";

interface PowerPoint {
  time: string;
  watts: number;
}

interface Props {
  currentWatts: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11]/95 px-3 py-2 backdrop-blur-xl">
        <p className="text-[10px] font-medium text-[#5a5a6e]">{label}</p>
        <p className="text-sm font-bold tabular-nums text-emerald-400">
          {payload[0].value}W
        </p>
      </div>
    );
  }
  return null;
}

export function PowerChart({ currentWatts }: Props) {
  const [history, setHistory] = useState<PowerPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setHistory((prev) => {
      const next = [...prev, { time: now, watts: currentWatts }];
      return next.length > 30 ? next.slice(-30) : next;
    });
  }, [currentWatts]);

  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#0e0e11]/60 p-px ring-1 ring-white/[0.04] backdrop-blur-sm">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0e0e11]/80 p-5">
        {/* Background glow */}
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f0f5]">Power Trend</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 py-1 ring-1 ring-white/[0.04]">
            <span className="text-[10px] font-medium text-[#5a5a6e]">Last 30s</span>
          </div>
        </div>

        {/* Chart */}
        <div ref={containerRef} className="relative flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#34d399" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
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
                tick={{ fontSize: 9, fill: "#3a3a47" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#3a3a47" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 500]}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
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
        <div className="relative mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium text-[#5a5a6e]">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span className="text-[10px] font-medium text-[#5a5a6e]">Average</span>
            </div>
          </div>
          <span className="text-[10px] font-medium tabular-nums text-[#5a5a6e]">
            {history.length} data points
          </span>
        </div>
      </div>
    </div>
  );
}
