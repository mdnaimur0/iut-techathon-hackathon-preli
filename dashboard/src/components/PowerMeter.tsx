import type { Usage } from "../types";
import { ROOM_NAMES } from "../types";

interface Props {
  usage: Usage;
}

const ROOM_COLORS: Record<string, { bar: string; glow: string }> = {
  drawing: { bar: "from-emerald-500 to-emerald-400", glow: "bg-emerald-500/20" },
  work1: { bar: "from-purple-500 to-purple-400", glow: "bg-purple-500/20" },
  work2: { bar: "from-amber-500 to-amber-400", glow: "bg-amber-500/20" },
};

export function PowerMeter({ usage }: Props) {
  const maxWatts = 495;
  const pct = Math.min((usage.total_watts_now / maxWatts) * 100, 100);

  // Radial gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference * 0.75; // 270 degree arc

  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#0e0e11]/60 p-px ring-1 ring-white/[0.04] backdrop-blur-sm">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0e0e11]/80 p-5">
        {/* Background glow */}
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

        {/* Header */}
        <div className="relative mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f0f5]">Power Meter</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 ring-1 ring-emerald-500/20">
            <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-[10px] font-semibold text-emerald-400">LIVE</span>
          </div>
        </div>

        {/* Radial Gauge */}
        <div className="relative mb-6 flex items-center justify-center">
          <svg width="180" height="150" viewBox="0 0 180 150">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
              <filter id="gaugeGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background arc */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.25}
              transform="rotate(135 90 90)"
            />
            {/* Active arc — CSS transition handles animation */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(135 90 90)"
              filter="url(#gaugeGlow)"
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.32, 0.72, 0, 1)" }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="animate-count-pulse text-4xl font-bold tabular-nums text-[#f0f0f5]"
              key={usage.total_watts_now}
            >
              {usage.total_watts_now}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5a5a6e]">Watts</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#5a5a6e]">Capacity</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-[#f0f0f5]">
              {pct.toFixed(0)}<span className="text-xs font-medium text-[#5a5a6e]">%</span>
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#5a5a6e]">Today</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-[#f0f0f5]">
              {usage.today_kwh}<span className="text-xs font-medium text-[#5a5a6e]"> kWh</span>
            </p>
          </div>
        </div>

        {/* Per-room breakdown */}
        <div className="relative mt-auto space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5a5a6e]">Room Breakdown</p>
          {Object.entries(ROOM_NAMES).map(([key, name]) => {
            const watts = usage.per_room_watts[key] ?? 0;
            const roomMax = 165;
            const roomPct = Math.min((watts / roomMax) * 100, 100);
            const colors = ROOM_COLORS[key] ?? ROOM_COLORS.drawing;
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#8e8ea0]">{name}</span>
                  <span className="text-[11px] font-semibold tabular-nums text-[#f0f0f5]">{watts}W</span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colors.bar}`}
                    style={{ width: `${roomPct}%`, transition: "width 0.8s cubic-bezier(0.32, 0.72, 0, 1)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
