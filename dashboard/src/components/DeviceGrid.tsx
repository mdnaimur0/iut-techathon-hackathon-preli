import type { Device } from "../types";
import { DeviceCard } from "./DeviceCard";
import { ROOM_NAMES } from "../types";

interface Props {
  devices: Device[];
}

const ROOM_ORDER = ["drawing", "work1", "work2"];

export function DeviceGrid({ devices }: Props) {
  const grouped = ROOM_ORDER.map((key) => ({
    key,
    name: ROOM_NAMES[key] ?? key,
    devices: devices.filter((d) => d.room === key),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {grouped.map((room) => {
        const onCount = room.devices.filter((d) => d.status === "on").length;
        return (
          <div key={room.key} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">{room.name}</h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                {onCount}/{room.devices.length} on
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {room.devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
