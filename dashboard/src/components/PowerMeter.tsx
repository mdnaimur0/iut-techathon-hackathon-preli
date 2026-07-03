import type { Usage } from "../types";
import { ROOM_NAMES } from "../types";

interface Props {
  usage: Usage;
}

export function PowerMeter({ usage }: Props) {
  const maxWatts = 495;
  const pct = Math.min((usage.total_watts_now / maxWatts) * 100, 100);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-4 text-base font-semibold text-zinc-100">Power Consumption</h2>

      <div className="mb-6">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-zinc-100">{usage.total_watts_now}</span>
          <span className="text-sm text-zinc-500">W</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">Max capacity: {maxWatts}W</p>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-zinc-200">{usage.today_kwh}</span>
          <span className="text-xs text-zinc-500">kWh today</span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(ROOM_NAMES).map(([key, name]) => {
          const watts = usage.per_room_watts[key] ?? 0;
          const roomMax = 165;
          const roomPct = Math.min((watts / roomMax) * 100, 100);
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">{name}</span>
                <span className="text-zinc-500">{watts}W</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
                  style={{ width: `${roomPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
