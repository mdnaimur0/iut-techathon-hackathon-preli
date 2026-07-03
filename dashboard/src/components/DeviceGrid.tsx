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

const ROOM_GLOWS: Record<string, string> = {
  drawing: "bg-(--color-accent-emerald-dim)",
  work1: "bg-(--color-accent-purple-dim)",
  work2: "bg-(--color-accent-amber-dim)",
};

export function DeviceGrid({ devices }: Props) {
  const grouped = ROOM_ORDER.map((key) => ({
    key,
    name: ROOM_NAMES[key] ?? key,
    devices: devices.filter((d) => d.room === key),
  }));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {grouped.map((room) => {
        const onCount = room.devices.filter((d) => d.status === "on").length;
        return (
          <div
            key={room.key}
            className="group/room h-full rounded-3xl bg-glass-bg p-1.5 ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-accent-emerald/20"
          >
            <div className="card-surface relative overflow-hidden rounded-[1.125rem] bg-onyx p-4">
              <div
                className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-3xl transition-opacity duration-700 ${
                  ROOM_GLOWS[room.key] ?? ROOM_GLOWS.drawing
                } opacity-50 group-hover/room:opacity-100`}
              />

              {/* Header */}
              <div className="relative mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-glass-bg ring-1 ring-glass-border">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path d={ROOM_ICONS[room.key] ?? ROOM_ICONS.drawing} />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-text-primary">
                    {room.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-glass-bg px-2 py-0.5 ring-1 ring-glass-border">
                  <span className="size-1.5 rounded-full bg-accent-emerald" />
                  <span className="text-[10px] font-semibold text-text-secondary">
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
