import type { Device } from "../types";

interface Props {
  devices: Device[];
}

function getDeviceStatus(devices: Device[], id: string): boolean {
  return devices.find((d) => d.id === id)?.status === "on";
}

// ─── Coordinate mapper ───
const W = 800;
const H = 400;
const sx = (d: number) => d * 8;
const sy = (d: number) => H - d * (H / 100);

// ─── Sub-components ───

function LightIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      {on && (
        <circle cx={x} cy={y} r={22} fill="#facc15" opacity={0.1}>
          <animate attributeName="r" from="16" to="26" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.12" to="0" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={x} cy={y} r={10} fill={on ? "#facc15" : "#2a2a33"} opacity={on ? 1 : 0.5} />
      {on && (
        <circle cx={x} cy={y} r={10} fill="#facc15" opacity={0.5}>
          <animate attributeName="opacity" from="0.6" to="0.15" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function FanIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  const brownOn = "#c8953a";
  const brownOff = "#4a3f30";
  return (
    <g>
      {on && (
        <circle cx={x} cy={y} r={24} fill={brownOn} opacity={0.06}>
          <animate attributeName="r" from="18" to="28" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.08" to="0" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Mount */}
      <circle cx={x} cy={y} r={4} fill={on ? brownOn : brownOff} />
      <g transform={`translate(${x}, ${y})`}>
        <g>
          {on && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
          {/* 3 blades */}
          {[0, 120, 240].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-11}
              rx={3.5}
              ry={11}
              fill={on ? brownOn : brownOff}
              opacity={on ? 0.9 : 0.5}
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
        {/* Center cap */}
        <circle cx={0} cy={0} r={3} fill={on ? "#d4a84a" : brownOff} />
      </g>
    </g>
  );
}

function PlantIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Pot */}
      <path d="M-5,3 L-4,10 L4,10 L5,3 Z" fill="#6b4226" />
      <rect x={-6} y={0} width={12} height={3} rx={1} fill="#7a5230" />
      {/* Leaves */}
      <ellipse cx={-5} cy={-4} rx={4} ry={8} fill="#22804a" opacity={0.8} transform="rotate(-20)" />
      <ellipse cx={5} cy={-4} rx={4} ry={8} fill="#2da858" opacity={0.8} transform="rotate(20)" />
      <ellipse cx={0} cy={-7} rx={3} ry={9} fill="#1a6a38" opacity={0.9} />
      <ellipse cx={-3} cy={-1} rx={3} ry={6} fill="#34b86a" opacity={0.7} transform="rotate(-10)" />
      <ellipse cx={3} cy={-1} rx={3} ry={6} fill="#34b86a" opacity={0.7} transform="rotate(10)" />
    </g>
  );
}

function DeskIcon({
  x,
  y,
  hasPaper,
  hasPlant,
  plantLeft,
}: {
  x: number;
  y: number;
  hasPaper?: boolean;
  hasPlant?: boolean;
  plantLeft?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Desk surface */}
      <rect x={-16} y={-12} width={32} height={24} rx={2} fill="#6b4226" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
      {/* Desk top edge highlight */}
      <rect x={-16} y={-12} width={32} height={2} rx={1} fill="#8a5a38" opacity={0.5} />
      {/* Monitor */}
      <rect x={-7} y={-10} width={14} height={10} rx={1} fill="#1a1a2e" />
      <rect x={-3} y={-6} width={6} height={4} rx={0.5} fill="#2a2a4e" opacity={0.5} />
      {/* Keyboard */}
      <rect x={-6} y={0} width={12} height={3} rx={0.8} fill="#2a2a2a" />
      {/* Mouse */}
      <ellipse cx={8} cy={1} rx={2} ry={1.5} fill="#2a2a2a" />
      {/* Chair */}
      <ellipse cx={0} cy={16} rx={7} ry={5} fill="#1a1a1a" />
      <rect x={-5} y={14} width={10} height={5} rx={2} fill="#1a1a1a" />
      {/* Optional paper */}
      {hasPaper && (
        <rect x={-14} y={-8} width={4} height={5} rx={0.5} fill="#f5f5dc" opacity={0.7} />
      )}
      {/* Optional tiny plant */}
      {hasPlant && (
        <g transform={`translate(${plantLeft ? -13 : 13}, ${7})`}>
          <rect x={-2} y={-1} width={4} height={4} rx={1} fill="#6b4226" />
          <ellipse cx={0} cy={-3} rx={2} ry={4} fill="#22804a" opacity={0.9} />
          <ellipse cx={-1} cy={-4} rx={1.5} ry={3} fill="#2da858" opacity={0.8} />
        </g>
      )}
    </g>
  );
}

function SofaIcon({ x, y }: { x: number; y: number }) {
  const seatH = 38;
  const seatW = 22;
  const gap = 6;
  const arm = 5;
  const totalH = 4 * seatH + 3 * gap + 2 * arm;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Backrest */}
      <rect x={-2} y={0} width={seatW + 8} height={totalH} rx={4} fill="#c4b599" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
      {/* Seat cushions (vertical stack) */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={3}
          y={arm + i * (seatH + gap)}
          width={seatW}
          height={seatH}
          rx={3}
          fill="#d4c5a9"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={0.3}
        />
      ))}
      {/* Armrests top & bottom */}
      <rect x={-2} y={0} width={seatW + 8} height={arm} rx={2} fill="#b8a88c" />
      <rect x={-2} y={totalH - arm} width={seatW + 8} height={arm} rx={2} fill="#b8a88c" />
      {/* Pillow accents */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={5}
          y={arm + i * (seatH + gap) + 1}
          width={seatW - 4}
          height={5}
          rx={2}
          fill="#e0d0b8"
          opacity={0.5}
        />
      ))}
    </g>
  );
}

function ArmchairIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Back */}
      <rect x={-9} y={0} width={18} height={18} rx={5} fill="#c4b599" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
      {/* Seat */}
      <rect x={-6} y={4} width={12} height={12} rx={3} fill="#d4c5a9" />
      {/* Armrests */}
      <rect x={-9} y={2} width={3} height={12} rx={1.5} fill="#b8a88c" />
      <rect x={6} y={2} width={3} height={12} rx={1.5} fill="#b8a88c" />
    </g>
  );
}

function CoffeeTableIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Table top */}
      <rect x={-18} y={-16} width={36} height={32} rx={3} fill="#5c3a1e" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
      {/* Top surface highlight */}
      <rect x={-16} y={-14} width={32} height={28} rx={2} fill="#6b4a2a" opacity={0.4} />
    </g>
  );
}

function RugIcon({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={100}
      height={90}
      rx={6}
      fill="rgba(160,160,160,0.08)"
      stroke="rgba(255,255,255,0.03)"
      strokeWidth={0.5}
    />
  );
}

function WaterDispenserIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Bottle */}
      <rect x={-6} y={-14} width={12} height={20} rx={4} fill="#3b82f6" opacity={0.4} />
      <circle cx={0} cy={-14} r={4} fill="#3b82f6" opacity={0.3} />
      {/* Base */}
      <rect x={-8} y={6} width={16} height={5} rx={2} fill="#1c1c22" />
      {/* Cup */}
      <rect x={-2} y={-20} width={4} height={5} rx={1} fill="rgba(255,255,255,0.1)" />
    </g>
  );
}

// ─── Wall drawing helper ───
function WallLine({ x1, y1, x2, y2, outer }: { x1: number; y1: number; x2: number; y2: number; outer?: boolean }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={outer ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.10)"}
      strokeWidth={outer ? 2.5 : 1.5}
      strokeLinecap="round"
    />
  );
}

function WindowIcon({ x, y, w, h, horizontal }: { x: number; y: number; w: number; h: number; horizontal?: boolean }) {
  if (horizontal) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={1} fill="#1e3a5f" opacity={0.6} />
        <rect x={x + 2} y={y + 1} width={w - 4} height={h - 2} rx={1} fill="#2563eb" opacity={0.25} />
        {/* Window dividers */}
        <line x1={x + w / 2} y1={y + 1} x2={x + w / 2} y2={y + h - 1} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1} fill="#1e3a5f" opacity={0.6} />
      <rect x={x + 1} y={y + 2} width={w - 2} height={h - 4} rx={1} fill="#2563eb" opacity={0.25} />
      <line x1={x + 1} y1={y + h / 2} x2={x + w - 1} y2={y + h / 2} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
    </g>
  );
}

function DoorIcon({
  x,
  y,
  w,
  h,
  hingeLeft,
  swingUp,
  open,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  hingeLeft?: boolean;
  swingUp?: boolean;
  open: boolean;
}) {
  if (!open) {
    return (
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={1}
        fill="#1c1c22"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />
    );
  }
  return (
    <g>
      {/* Door leaf swung into room */}
      {swingUp && (
        <rect
          x={hingeLeft ? x + 2 : x + w - 4}
          y={y - h + 4}
          width={4}
          height={h - 4}
          rx={1}
          fill="#1c1c22"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.6}
        />
      )}
      {/* Swing arc */}
      <path
        d={
          hingeLeft && swingUp
            ? `M ${x + 2} ${y + h} A ${w} ${h} 0 0 1 ${x + w} ${y}`
            : `M ${x + w - 2} ${y + h} A ${w} ${h} 0 0 0 ${x} ${y}`
        }
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={0.8}
        strokeDasharray="3 3"
      />
    </g>
  );
}

// ─── Main component ───
export function FloorPlan({ devices }: Props) {
  const isOfficeOpen = devices.some((d) => d.status === "on");
  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#0e0e11]/60 p-px ring-1 ring-white/[0.04] backdrop-blur-sm">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0e0e11]/80 p-5">
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f0f5]">Office Floor Plan</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
                <circle cx="6" cy="6" r="5" fill="#facc15" opacity={0.15} />
                <circle cx="6" cy="6" r="3" fill="#facc15" />
              </svg>
              <span className="text-[10px] font-medium text-[#5a5a6e]">Lights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
                {[0, 120, 240].map((a) => (
                  <ellipse key={a} cx={6} cy={2.5} rx={1.2} ry={3.5} fill="#c8953a" opacity={0.8} transform={`rotate(${a}, 6, 6)`} />
                ))}
                <circle cx="6" cy="6" r="1.5" fill="#d4a84a" />
              </svg>
              <span className="text-[10px] font-medium text-[#5a5a6e]">Fans</span>
            </div>
          </div>
        </div>

        {/* SVG Floor Plan */}
        <div className="relative flex-1 flex items-center justify-center overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
            {/* ────────── Background & Grid ────────── */}
            <rect x={0} y={0} width={W} height={H} rx={10} fill="#08080a" stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} />

            {Array.from({ length: 17 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={H} stroke="rgba(255,255,255,0.012)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 50} x2={W} y2={i * 50} stroke="rgba(255,255,255,0.012)" strokeWidth={0.5} />
            ))}

            {/* ────────── Room Floors (bottom layer) ────────── */}
            {/* Drawing Room — beige/light tan tiled floor */}
            <rect x={0} y={0} width={sx(35)} height={sy(15)} rx={0} fill="rgba(200,180,150,0.10)" />
            {/* Subtle tile pattern */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`dt${i}`} x1={i * (sx(35) / 6)} y1={0} x2={i * (sx(35) / 6)} y2={sy(15)} stroke="rgba(200,180,150,0.04)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`dh${i}`} x1={0} y1={i * (sy(15) / 10)} x2={sx(35)} y2={i * (sy(15) / 10)} stroke="rgba(200,180,150,0.04)" strokeWidth={0.5} />
            ))}

            {/* Work Room 1 — light grey square tiled floor */}
            <rect x={sx(35)} y={0} width={sx(31)} height={sy(15)} rx={0} fill="rgba(200,200,210,0.08)" />
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`w1v${i}`} x1={sx(35) + i * (sx(31) / 5)} y1={0} x2={sx(35) + i * (sx(31) / 5)} y2={sy(15)} stroke="rgba(200,200,210,0.04)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`w1h${i}`} x1={sx(35)} y1={i * (sy(15) / 10)} x2={sx(66)} y2={i * (sy(15) / 10)} stroke="rgba(200,200,210,0.04)" strokeWidth={0.5} />
            ))}

            {/* Work Room 2 — light brown wood plank floor */}
            <rect x={sx(66)} y={0} width={sx(34)} height={sy(15)} rx={0} fill="rgba(180,160,130,0.08)" />
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={`w2h${i}`} x1={sx(66)} y1={i * (sy(15) / 18)} x2={W} y2={i * (sy(15) / 18)} stroke="rgba(180,160,130,0.05)" strokeWidth={0.5} />
            ))}

            {/* Hallway */}
            <rect x={0} y={sy(15)} width={W} height={sy(0) - sy(15)} rx={0} fill="rgba(255,255,255,0.03)" />

            {/* ────────── Room Outline Backgrounds ────────── */}
            <rect x={0} y={0} width={sx(35)} height={sy(15)} rx={8} fill="none" stroke="rgba(200,180,150,0.08)" strokeWidth={1} />
            <rect x={sx(35)} y={0} width={sx(31)} height={sy(15)} rx={8} fill="none" stroke="rgba(200,200,210,0.08)" strokeWidth={1} />
            <rect x={sx(66)} y={0} width={sx(34)} height={sy(15)} rx={8} fill="none" stroke="rgba(180,160,130,0.08)" strokeWidth={1} />

            {/* ────────── Room Labels ────────── */}
            <text x={sx(17.5)} y={sy(92)} textAnchor="middle" fontSize={11} fill="#8e8ea0" fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">DRAWING ROOM</text>
            <text x={sx(50.5)} y={sy(92)} textAnchor="middle" fontSize={11} fill="#8e8ea0" fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">WORK ROOM 1</text>
            <text x={sx(83)} y={sy(92)} textAnchor="middle" fontSize={11} fill="#8e8ea0" fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">WORK ROOM 2</text>
            <text x={sx(50)} y={sy(7)} textAnchor="middle" fontSize={8} fill="#3a3a4a" fontFamily="'Plus Jakarta Sans', sans-serif">HALLWAY / CORRIDOR</text>

            {/* ────────── Outer Walls ────────── */}
            {/* Top wall */}
            <WallLine x1={0} y1={0} x2={W} y2={0} outer />
            {/* Left wall */}
            <WallLine x1={0} y1={0} x2={0} y2={H} outer />
            {/* Right wall */}
            <WallLine x1={W} y1={0} x2={W} y2={H} outer />
            {/* Bottom wall segments (entry door gap) */}
            <WallLine x1={0} y1={H} x2={sx(49)} y2={H} outer />
            <WallLine x1={sx(55)} y1={H} x2={W} y2={H} outer />

            {/* ────────── Inner Walls ────────── */}
            {/* Between Drawing Room & Work Room 1 */}
            <WallLine x1={sx(35)} y1={0} x2={sx(35)} y2={sy(15)} />
            {/* Between Work Room 1 & Work Room 2 */}
            <WallLine x1={sx(66)} y1={0} x2={sx(66)} y2={sy(15)} />

            {/* Hallway ceiling segments (room bottom walls with door gaps) */}
            <WallLine x1={0} y1={sy(15)} x2={sx(20.5)} y2={sy(15)} outer />
            <WallLine x1={sx(25.5)} y1={sy(15)} x2={sx(36.5)} y2={sy(15)} />
            <WallLine x1={sx(41.5)} y1={sy(15)} x2={sx(67.5)} y2={sy(15)} />
            <WallLine x1={sx(72.5)} y1={sy(15)} x2={W} y2={sy(15)} />

            {/* ────────── Windows ────────── */}
            {/* Drawing Room — far-left wall window */}
            <WindowIcon x={-2} y={sy(55)} w={4} h={40} />
            {/* Work Room 1 — centered top wall */}
            <WindowIcon x={sx(46)} y={-2} w={64} h={4} horizontal />
            {/* Work Room 2 — centered top wall */}
            <WindowIcon x={sx(76)} y={-2} w={64} h={4} horizontal />
            {/* Work Room 2 — rightmost outer wall */}
            <WindowIcon x={W - 2} y={sy(48)} w={4} h={40} />

            {/* ────────── Doors ────────── */}
            {/* Main entry — bottom center, opens inward to right */}
            <DoorIcon x={sx(49)} y={sy(0) - 16} w={sx(6)} h={16} hingeLeft swingUp open={isOfficeOpen} />
            <text x={sx(52)} y={sy(-1) + 14} textAnchor="middle" fontSize={7} fill="#5a5a6e" fontFamily="'Plus Jakarta Sans', sans-serif">ENTRY</text>

            {/* Drawing Room door — bottom wall, opens inward against right wall */}
            <DoorIcon x={sx(20.5)} y={sy(15) - 14} w={sx(5)} h={14} hingeLeft swingUp open={isOfficeOpen} />

            {/* Work Room 1 door — bottom wall, opens inward against left wall */}
            <DoorIcon x={sx(36.5)} y={sy(15) - 14} w={sx(5)} h={14} hingeLeft={false} swingUp open={isOfficeOpen} />

            {/* Work Room 2 door — bottom wall, opens inward against left wall */}
            <DoorIcon x={sx(67.5)} y={sy(15) - 14} w={sx(5)} h={14} hingeLeft={false} swingUp open={isOfficeOpen} />

            {/* ────────── Hallway Elements ────────── */}
            {/* Bottom-left plant */}
            <PlantIcon x={sx(5)} y={sy(5)} />
            {/* Bottom-right plant */}
            <PlantIcon x={sx(87)} y={sy(5)} />
            {/* Water dispenser */}
            <WaterDispenserIcon x={sx(93)} y={sy(5)} />
            {/* Small vertical wall partition next to water dispenser */}
            <line x1={sx(91)} y1={sy(8)} x2={sx(91)} y2={sy(2)} stroke="rgba(255,255,255,0.10)" strokeWidth={1.5} />

            {/* ────────── Drawing Room: Furniture ────────── */}
            {/* Rug */}
            {/* Rug centered around coffee table */}
            <RugIcon x={sx(12)} y={sy(62)} />
            {/* Coffee table */}
            <CoffeeTableIcon x={sx(17)} y={sy(55)} />
            {/* Sofa — runs vertically along left wall, 4-seater (y=45 to y=75 desc) */}
            <SofaIcon x={sx(5)} y={sy(75)} />
            {/* Armchair — lower-left area (x=7, y=25 desc) */}
            <ArmchairIcon x={sx(7)} y={sy(25)} />

            {/* Drawing Room: Plants */}
            <PlantIcon x={sx(5)} y={sy(95)} /> {/* top-left corner */}
            <PlantIcon x={sx(31)} y={sy(23)} /> {/* bottom-right corner */}

            {/* ────────── Drawing Room: Ceiling Fixtures ────────── */}
            {/* Fans */}
            <FanIcon x={sx(20)} y={sy(85)} on={getDeviceStatus(devices, "drawing-fan-1")} />
            <FanIcon x={sx(20)} y={sy(35)} on={getDeviceStatus(devices, "drawing-fan-2")} />
            {/* Lights */}
            <LightIcon x={sx(11)} y={sy(88)} on={getDeviceStatus(devices, "drawing-light-1")} />
            <LightIcon x={sx(29)} y={sy(88)} on={getDeviceStatus(devices, "drawing-light-2")} />
            <LightIcon x={sx(20)} y={sy(22)} on={getDeviceStatus(devices, "drawing-light-3")} />

            {/* ────────── Work Room 1: Furniture ────────── */}
            {/* Top-Left Desk */}
            <DeskIcon x={sx(41)} y={sy(75)} hasPaper />
            {/* Top-Right Desk */}
            <DeskIcon x={sx(60)} y={sy(75)} hasPaper />
            {/* Bottom-Left Desk */}
            <DeskIcon x={sx(41)} y={sy(45)} hasPlant plantLeft />
            {/* Bottom-Right Desk */}
            <DeskIcon x={sx(60)} y={sy(45)} hasPlant plantLeft={false} />

            {/* ────────── Work Room 1: Ceiling Fixtures ────────── */}
            {/* Fans */}
            <FanIcon x={sx(51)} y={sy(85)} on={getDeviceStatus(devices, "work1-fan-1")} />
            <FanIcon x={sx(51)} y={sy(45)} on={getDeviceStatus(devices, "work1-fan-2")} />
            {/* Lights */}
            <LightIcon x={sx(43)} y={sy(88)} on={getDeviceStatus(devices, "work1-light-1")} />
            <LightIcon x={sx(59)} y={sy(88)} on={getDeviceStatus(devices, "work1-light-2")} />
            <LightIcon x={sx(51)} y={sy(22)} on={getDeviceStatus(devices, "work1-light-3")} />

            {/* ────────── Work Room 2: Furniture ────────── */}
            {/* Top-Left Desk */}
            <DeskIcon x={sx(72)} y={sy(75)} hasPlant plantLeft />
            {/* Top-Right Desk */}
            <DeskIcon x={sx(91)} y={sy(75)} hasPaper hasPlant plantLeft={false} />
            {/* Bottom-Left Desk */}
            <DeskIcon x={sx(72)} y={sy(45)} hasPlant plantLeft />
            {/* Bottom-Right Desk */}
            <DeskIcon x={sx(91)} y={sy(45)} hasPlant plantLeft={false} />

            {/* ────────── Work Room 2: Ceiling Fixtures ────────── */}
            {/* Fans */}
            <FanIcon x={sx(82)} y={sy(85)} on={getDeviceStatus(devices, "work2-fan-1")} />
            <FanIcon x={sx(82)} y={sy(45)} on={getDeviceStatus(devices, "work2-fan-2")} />
            {/* Lights */}
            <LightIcon x={sx(74)} y={sy(88)} on={getDeviceStatus(devices, "work2-light-1")} />
            <LightIcon x={sx(90)} y={sy(88)} on={getDeviceStatus(devices, "work2-light-2")} />
            <LightIcon x={sx(82)} y={sy(22)} on={getDeviceStatus(devices, "work2-light-3")} />
          </svg>
        </div>
      </div>
    </div>
  );
}
