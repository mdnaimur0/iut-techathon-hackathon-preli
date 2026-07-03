import type { Alert } from "../types";

interface Props {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: Props) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#0e0e11]/60 p-px ring-1 ring-white/[0.04] backdrop-blur-sm">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0e0e11]/80 p-5">
        {/* Background glow */}
        {alerts.length > 0 && (
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-red-500/5 blur-3xl" />
        )}

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.05]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#5a5a6e]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#f0f0f5]">Active Alerts</h3>
          </div>
          {alerts.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 ring-1 ring-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-red-400">{alerts.length}</span>
            </div>
          )}
        </div>

        {/* Alert list */}
        <div className="relative flex-1 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          {alerts.length === 0 ? (
            <div className="animate-fade-in flex min-h-[120px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.04]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#3a3a47]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-[#3a3a47]">All clear</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                            className={`h-3 w-3 ${
                              alert.severity === "critical" ? "text-red-400" : "text-amber-400"
                            }`}
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
  );
}
