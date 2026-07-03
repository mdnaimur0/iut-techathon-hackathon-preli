import { motion } from "framer-motion";
import type { Device } from "../types";

interface Props {
  devices: Device[];
}

function getDeviceStatus(devices: Device[], id: string): boolean {
  return devices.find((d) => d.id === id)?.status === "on";
}

function LightIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={8}
        fill={on ? "#facc15" : "#3f3f46"}
        opacity={on ? 1 : 0.5}
      />
      {on && (
        <circle
          cx={x}
          cy={y}
          r={14}
          fill="none"
          stroke="#facc15"
          strokeWidth={1}
          opacity={0.3}
        >
          <animate attributeName="r" from="10" to="18" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function FanIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      <motion.g
        style={{ originX: `${x}px`, originY: `${y}px` }}
        animate={on ? { rotate: 360 } : { rotate: 0 }}
        transition={on ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.3 }}
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx={x}
            cy={y - 7}
            rx={3}
            ry={7}
            fill={on ? "#34d399" : "#52525b"}
            opacity={on ? 0.9 : 0.4}
            transform={`rotate(${angle} ${x} ${y})`}
          />
        ))}
      </motion.g>
      <circle cx={x} cy={y} r={3} fill={on ? "#10b981" : "#3f3f46"} />
    </g>
  );
}

export function FloorPlan({ devices }: Props) {
  const w = 700;
  const h = 400;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-4 text-base font-semibold text-zinc-100">Office Floor Plan</h2>
      <div className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[700px]" xmlns="http://www.w3.org/2000/svg">
          {/* Background */}
          <rect x={0} y={0} width={w} height={h} rx={12} fill="#18181b" stroke="#27272a" strokeWidth={2} />

          {/* Entry door */}
          <rect x={320} y={385} width={60} height={15} rx={2} fill="#3f3f46" />
          <text x={350} y={412} textAnchor="middle" fontSize={9} fill="#71717a">Entry</text>

          {/* Drawing Room */}
          <rect x={10} y={10} width={210} height={180} rx={8} fill="none" stroke="#3f3f46" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={115} y={30} textAnchor="middle" fontSize={11} fill="#a1a1aa" fontWeight={600}>Drawing Room</text>
          {/* Sofa */}
          <rect x={25} y={130} width={60} height={20} rx={4} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={55} y={144} textAnchor="middle" fontSize={7} fill="#52525b">Sofa</text>
          {/* Table */}
          <rect x={140} y={110} width={40} height={40} rx={4} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={160} y={134} textAnchor="middle" fontSize={7} fill="#52525b">Table</text>
          {/* Window */}
          <rect x={10} y={90} width={8} height={40} rx={2} fill="#1e3a5f" opacity={0.6} />

          {/* Fans & Lights - Drawing Room */}
          <FanIcon x={60} y={70} on={getDeviceStatus(devices, "drawing-fan-1")} />
          <FanIcon x={170} y={70} on={getDeviceStatus(devices, "drawing-fan-2")} />
          <LightIcon x={115} y={55} on={getDeviceStatus(devices, "drawing-light-1")} />
          <LightIcon x={40} y={110} on={getDeviceStatus(devices, "drawing-light-2")} />
          <LightIcon x={190} y={110} on={getDeviceStatus(devices, "drawing-light-3")} />

          {/* Work Room 1 */}
          <rect x={240} y={10} width={210} height={180} rx={8} fill="none" stroke="#3f3f46" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={345} y={30} textAnchor="middle" fontSize={11} fill="#a1a1aa" fontWeight={600}>Work Room 1</text>
          {/* Desks */}
          <rect x={260} y={60} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={285} y={79} textAnchor="middle" fontSize={7} fill="#52525b">Desk</text>
          <rect x={340} y={60} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={365} y={79} textAnchor="middle" fontSize={7} fill="#52525b">Desk</text>
          <rect x={260} y={120} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <rect x={340} y={120} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          {/* Chairs */}
          <circle cx={285} cy={100} r={6} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <circle cx={365} cy={100} r={6} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <circle cx={285} cy={160} r={6} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <circle cx={365} cy={160} r={6} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          {/* Window */}
          <rect x={336} y={10} width={60} height={8} rx={2} fill="#1e3a5f" opacity={0.6} />

          {/* Fans & Lights - Work Room 1 */}
          <FanIcon x={290} y={48} on={getDeviceStatus(devices, "work1-fan-1")} />
          <FanIcon x={400} y={48} on={getDeviceStatus(devices, "work1-fan-2")} />
          <LightIcon x={345} y={45} on={getDeviceStatus(devices, "work1-light-1")} />
          <LightIcon x={270} y={150} on={getDeviceStatus(devices, "work1-light-2")} />
          <LightIcon x={420} y={150} on={getDeviceStatus(devices, "work1-light-3")} />

          {/* Work Room 2 */}
          <rect x={470} y={10} width={220} height={180} rx={8} fill="none" stroke="#3f3f46" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={580} y={30} textAnchor="middle" fontSize={11} fill="#a1a1aa" fontWeight={600}>Work Room 2</text>
          {/* Desks */}
          <rect x={490} y={60} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={515} y={79} textAnchor="middle" fontSize={7} fill="#52525b">Desk</text>
          <rect x={570} y={60} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={595} y={79} textAnchor="middle" fontSize={7} fill="#52525b">Desk</text>
          <rect x={490} y={120} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <rect x={570} y={120} width={50} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          {/* Water cooler */}
          <rect x={640} y={100} width={20} height={30} rx={3} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
          <text x={650} y={119} textAnchor="middle" fontSize={5} fill="#52525b">WC</text>
          {/* Plant */}
          <circle cx={490} cy={155} r={8} fill="#1a2e1a" stroke="#2d5a2d" strokeWidth={1} />
          {/* Window */}
          <rect x={556} y={10} width={60} height={8} rx={2} fill="#1e3a5f" opacity={0.6} />

          {/* Fans & Lights - Work Room 2 */}
          <FanIcon x={520} y={48} on={getDeviceStatus(devices, "work2-fan-1")} />
          <FanIcon x={630} y={48} on={getDeviceStatus(devices, "work2-fan-2")} />
          <LightIcon x={575} y={45} on={getDeviceStatus(devices, "work2-light-1")} />
          <LightIcon x={500} y={155} on={getDeviceStatus(devices, "work2-light-2")} />
          <LightIcon x={650} y={155} on={getDeviceStatus(devices, "work2-light-3")} />

          {/* Divider walls */}
          <line x1={230} y1={10} x2={230} y2={190} stroke="#3f3f46" strokeWidth={2} />
          <line x1={460} y1={10} x2={460} y2={190} stroke="#3f3f46" strokeWidth={2} />
          {/* Door gaps */}
          <rect x={225} y={170} width={10} height={20} fill="#18181b" />
          <rect x={455} y={170} width={10} height={20} fill="#18181b" />

          {/* Lower area - common space */}
          <rect x={10} y={200} width={680} height={180} rx={8} fill="none" stroke="#27272a" strokeWidth={1} strokeDasharray="4 2" />
          <text x={350} y={220} textAnchor="middle" fontSize={10} fill="#52525b">Common Area / Corridor</text>
        </svg>
      </div>
    </div>
  );
}
