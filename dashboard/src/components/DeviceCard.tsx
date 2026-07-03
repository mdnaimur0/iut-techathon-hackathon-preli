import type { Device } from "../types";

interface Props {
  device: Device;
}

export function DeviceCard({ device }: Props) {
  const isOn = device.status === "on";
  const isFan = device.type === "fan";

  return (
    <div className="animate-fade-in-scale group relative">
      <div
        className={`relative rounded-xl p-px transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOn
            ? "bg-gradient-to-br from-emerald-500/25 via-emerald-500/8 to-transparent"
            : "bg-white/[0.04]"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-[calc(0.75rem-1px)] px-3 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isOn
              ? "bg-[#0e0e11]/90"
              : "bg-[#0e0e11]/70"
          }`}
        >
          {isOn && (
            <div
              className={`absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl ${
                isFan ? "bg-emerald-500/12" : "bg-amber-500/12"
              }`}
            />
          )}

          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500 ${
                  isOn
                    ? isFan
                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                      : "bg-amber-500/10 ring-1 ring-amber-500/20"
                    : "bg-white/[0.03] ring-1 ring-white/[0.04]"
                }`}
              >
                {isFan ? (
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${isOn ? "text-emerald-400" : "text-[#5a5a6e]"} ${isOn ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${isOn ? "text-amber-400" : "text-[#5a5a6e]"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#f0f0f5]">{device.name}</p>
                <p className="text-[10px] font-medium text-[#5a5a6e]">
                  {isFan ? "Fan" : "Light"} · {device.watts}W
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider ${
                  isOn ? "text-emerald-400" : "text-[#5a5a6e]"
                }`}
              >
                {isOn ? "ON" : "OFF"}
              </span>
              <div className="relative">
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                    isOn ? "bg-emerald-400" : "bg-[#3a3a47]"
                  }`}
                />
                {isOn && (
                  <span className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-40" />
                )}
              </div>
            </div>
          </div>

          {/* Timestamp — slim inline */}
          <div className="relative mt-1.5 flex items-center gap-1">
            <svg className="h-2.5 w-2.5 text-[#3a3a47]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span className="text-[9px] font-medium text-[#3a3a47]">
              {new Date(device.last_changed).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
