import type { Alert } from "../types";

interface Props {
  alerts: Alert[];
  onClose?: () => void;
}

export function AlertsPanel({ alerts, onClose }: Props) {
  return (
    <div className="overflow-hidden rounded-4xl bg-glass-bg p-1.5 ring-1 ring-glass-border">
      <div className="relative flex flex-col rounded-[1.625rem] bg-onyx shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        {alerts.length > 0 && (
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent-red-dim blur-3xl" />
        )}

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-glass-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-red-dim ring-1 ring-accent-red/20">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent-red" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Active Alerts</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="group flex h-7 w-7 items-center justify-center rounded-full bg-glass-bg ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:ring-accent-red/30"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-text-tertiary transition-all duration-500 group-hover:text-accent-red" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Alert list */}
        <div className="relative max-h-[60vh] overflow-y-auto p-3 overflow-x-hidden" style={{ scrollbarGutter: "stable" }}>
          {alerts.length === 0 ? (
            <div className="flex min-h-30 flex-1 items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glass-bg ring-1 ring-glass-border">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-mid" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-mid">All clear</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group/alert rounded-[1.25rem] bg-glass-bg p-1 ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-red-dim/3"
                >
                  <div className="relative rounded-2xl p-3">
                    <div
                      className={`absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl ${
                        alert.severity === "critical" ? "bg-accent-red-dim" : "bg-accent-amber-dim"
                      }`}
                    />

                    <div className="relative flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                            alert.severity === "critical"
                              ? "bg-accent-red-dim ring-1 ring-accent-red/20"
                              : "bg-accent-amber-dim ring-1 ring-accent-amber/20"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-3 w-3 ${alert.severity === "critical" ? "text-accent-red" : "text-accent-amber"}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium leading-relaxed text-text-secondary">
                            {alert.message}
                          </p>
                          <p className="mt-1 text-[9px] font-medium text-text-tertiary">
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
                            ? "bg-accent-red-dim text-accent-red ring-1 ring-accent-red/20"
                            : "bg-accent-amber-dim text-accent-amber ring-1 ring-accent-amber/20"
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
  );
}
