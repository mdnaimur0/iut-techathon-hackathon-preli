export type DeviceType = "fan" | "light";
export type Status = "on" | "off";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  status: Status;
  watts: number;
  last_changed: string;
}

export interface Alert {
  id: string;
  severity: string;
  message: string;
  room: string | null;
  created_at: string;
}

export interface Usage {
  total_watts_now: number;
  per_room_watts: Record<string, number>;
  today_kwh: number;
}

export interface StateMessage {
  type: "state";
  devices: Device[];
}

export interface AlertsMessage {
  type: "alerts";
  alerts: Alert[];
}

export type WSMessage = StateMessage | AlertsMessage;

export const ROOM_NAMES: Record<string, string> = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};
