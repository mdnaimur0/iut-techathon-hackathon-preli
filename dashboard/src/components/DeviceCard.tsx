import { motion } from "framer-motion";
import type { Device } from "../types";

interface Props {
  device: Device;
}

export function DeviceCard({ device }: Props) {
  const isOn = device.status === "on";
  const isFan = device.type === "fan";

  return (
    <motion.div
      layout
      className={`relative rounded-xl border p-4 transition-colors duration-300 ${
        isOn
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-zinc-700 bg-zinc-800/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
              isOn
                ? isFan
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
                : "bg-zinc-700 text-zinc-500"
            }`}
          >
            {isFan ? (
              <motion.svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                animate={isOn ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isOn
                    ? { repeat: Infinity, duration: 1, ease: "linear" }
                    : { duration: 0.5 }
                }
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </motion.svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">{device.name}</p>
            <p className="text-xs text-zinc-500">{isFan ? "Fan" : "Light"} &middot; {device.watts}W</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isOn ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-zinc-600"
            }`}
          />
          <span className={`text-xs font-medium ${isOn ? "text-emerald-400" : "text-zinc-500"}`}>
            {isOn ? "ON" : "OFF"}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">
        Last changed: {new Date(device.last_changed).toLocaleTimeString()}
      </p>
    </motion.div>
  );
}
