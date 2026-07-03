import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

interface PowerPoint {
  time: string;
  watts: number;
}

interface Props {
  currentWatts: number;
}

export function PowerChart({ currentWatts }: Props) {
  const [history, setHistory] = useState<PowerPoint[]>([]);

  useEffect(() => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setHistory((prev) => {
      const next = [...prev, { time: now, watts: currentWatts }];
      return next.length > 30 ? next.slice(-30) : next;
    });
  }, [currentWatts]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-4 text-base font-semibold text-zinc-100">Power Trend</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#71717a" }} />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} domain={[0, 500]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line
              type="monotone"
              dataKey="watts"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
