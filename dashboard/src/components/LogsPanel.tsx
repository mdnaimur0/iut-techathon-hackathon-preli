import type { ChangeLog } from "../types";
import { ROOM_NAMES } from "../types";

interface Props {
  logs: ChangeLog[];
  onClose?: () => void;
}

function formatRoom(room: string): string {
  return ROOM_NAMES[room] ?? room;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LogsPanel({ logs, onClose }: Props) {
  return (
    <div className="overflow-hidden rounded-4xl bg-glass-bg p-1.5 ring-1 ring-glass-border">
      <div className="card-surface relative flex flex-col rounded-[1.625rem] bg-onyx">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent-purple-dim blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-glass-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-purple-dim ring-1 ring-accent-purple/20">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-accent-purple"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              Change Logs
            </h3>
            <span className="rounded-full bg-glass-bg px-2 py-0.5 text-[9px] font-semibold text-text-tertiary ring-1 ring-glass-border">
              {logs.length}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="group flex h-7 w-7 items-center justify-center rounded-full bg-glass-bg ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:ring-accent-red/30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-text-tertiary transition-all duration-500 group-hover:text-accent-red"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Table */}
        <div
          className="relative max-h-[60vh] overflow-y-auto overflow-x-hidden p-3"
          style={{ scrollbarGutter: "stable" }}
        >
          {logs.length === 0 ? (
            <div className="flex min-h-30 flex-1 items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glass-bg ring-1 ring-glass-border">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-slate-mid"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-mid">
                  No changes recorded yet
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="pb-2 pr-3 font-medium text-text-tertiary">
                      Device
                    </th>
                    <th className="pb-2 pr-3 font-medium text-text-tertiary">
                      Room
                    </th>
                    <th className="pb-2 pr-3 font-medium text-text-tertiary">
                      Change
                    </th>
                    <th className="pb-2 font-medium text-text-tertiary">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors duration-300 hover:bg-glass-bg"
                    >
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              log.device_type === "fan"
                                ? "bg-accent-emerald"
                                : "bg-accent-amber"
                            }`}
                          />
                          <span className="font-medium text-text-secondary">
                            {log.device_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-text-tertiary">
                        {formatRoom(log.room)}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                              log.old_status === "on"
                                ? "bg-accent-emerald-dim text-accent-emerald ring-1 ring-accent-emerald/20"
                                : "bg-glass-bg text-text-tertiary ring-1 ring-glass-border"
                            }`}
                          >
                            {log.old_status.toUpperCase()}
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3 text-slate-mid"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                              log.new_status === "on"
                                ? "bg-accent-emerald-dim text-accent-emerald ring-1 ring-accent-emerald/20"
                                : "bg-glass-bg text-text-tertiary ring-1 ring-glass-border"
                            }`}
                          >
                            {log.new_status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-text-tertiary">
                        {formatTime(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
