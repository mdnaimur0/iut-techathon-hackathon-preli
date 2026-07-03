import type { Device } from "../types";
import { DeviceCard } from "./DeviceCard";
import { ROOM_NAMES } from "../types";

interface Props {
  devices: Device[];
}

const ROOM_ORDER = ["drawing", "work1", "work2"];

const ROOM_ICONS: Record<string, string> = {
  drawing: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  work1: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z",
  work2: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z",
};

export function DeviceGrid({ devices }: Props) {
  const grouped = ROOM_ORDER.map((key) => ({
    key,
    name: ROOM_NAMES[key] ?? key,
    devices: devices.filter((d) => d.room === key),
  }));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {grouped.map((room, idx) => {
        const onCount = room.devices.filter((d) => d.status === "on").length;
        return (
          <div
            key={room.key}
            className="group/room relative overflow-hidden rounded-2xl bg-[#0e0e11]/60 p-px ring-1 ring-white/[0.04] backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-white/[0.08]"
          >
            <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#0e0e11]/80 p-4">
              <div
                className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-3xl transition-opacity duration-500 ${
                  idx === 0 ? "bg-emerald-500/5" : idx === 1 ? "bg-purple-500/5" : "bg-amber-500/5"
                } opacity-60 group-hover/room:opacity-100`}
              />

              {/* Header */}
              <div className="relative mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.05]">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#5a5a6e]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d={ROOM_ICONS[room.key] ?? ROOM_ICONS.drawing} />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-[#f0f0f5]">{room.name}</h3>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 ring-1 ring-white/[0.04]">
                  <span className="h-0.5 w-0.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-semibold text-[#8e8ea0]">
                    {onCount}/{room.devices.length}
                  </span>
                </div>
              </div>

              {/* Device cards */}
              <div className="relative grid grid-cols-1 gap-1.5">
                {room.devices.map((device) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
