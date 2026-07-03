import type { Alert } from "../types";

interface Props {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-100">Active Alerts</h2>
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-zinc-500">No active alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-3 text-base font-semibold text-zinc-100">
        Active Alerts{" "}
        <span className="ml-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
          {alerts.length}
        </span>
      </h2>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 ${
              alert.severity === "critical"
                ? "border-red-500/40 bg-red-500/10"
                : "border-amber-500/40 bg-amber-500/10"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-zinc-200">{alert.message}</p>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  alert.severity === "critical"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {alert.severity.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
