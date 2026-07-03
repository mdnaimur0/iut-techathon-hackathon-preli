import type { Device } from "../types";

interface Props {
  devices: Device[];
}

function getDeviceStatus(devices: Device[], id: string): boolean {
  return devices.find((d) => d.id === id)?.status === "on";
}

const W = 800;
const H = 400;
const sx = (d: number) => d * 8;
const sy = (d: number) => H - d * (H / 100);

function LightIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      {on && (
        <circle cx={x} cy={y} r={22} fill="#facc15" opacity={0.1}>
          <animate
            attributeName="r"
            from="16"
            to="26"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.12"
            to="0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <circle
        cx={x}
        cy={y}
        r={10}
        fill={on ? "#facc15" : "var(--fp-light-off)"}
        opacity={on ? 1 : 0.5}
      />
      {on && (
        <circle cx={x} cy={y} r={10} fill="#facc15" opacity={0.5}>
          <animate
            attributeName="opacity"
            from="0.6"
            to="0.15"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

function FanIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      {on && (
        <circle cx={x} cy={y} r={24} fill="var(--fp-fan-blade-on)" opacity={0.06}>
          <animate
            attributeName="r"
            from="18"
            to="28"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.08"
            to="0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <circle cx={x} cy={y} r={4} fill={on ? "var(--fp-fan-center-on)" : "var(--fp-fan-center-off)"} />
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
          {[0, 120, 240].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-11}
              rx={3.5}
              ry={11}
              fill={on ? "var(--fp-fan-blade-on)" : "var(--fp-fan-blade-off)"}
              opacity={on ? 0.9 : 0.5}
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
        <circle cx={0} cy={0} r={3} fill={on ? "var(--fp-fan-center-on)" : "var(--fp-fan-center-off)"} />
      </g>
    </g>
  );
}

function PlantIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M-5,3 L-4,10 L4,10 L5,3 Z" fill="var(--fp-plant-pot)" />
      <rect x={-6} y={0} width={12} height={3} rx={1} fill="var(--fp-plant-pot-light)" />
      <ellipse
        cx={-5}
        cy={-4}
        rx={4}
        ry={8}
        fill="var(--fp-plant-dark)"
        opacity={0.8}
        transform="rotate(-20)"
      />
      <ellipse
        cx={5}
        cy={-4}
        rx={4}
        ry={8}
        fill="var(--fp-plant-mid)"
        opacity={0.8}
        transform="rotate(20)"
      />
      <ellipse cx={0} cy={-7} rx={3} ry={9} fill="var(--fp-plant-center)" opacity={0.9} />
      <ellipse
        cx={-3}
        cy={-1}
        rx={3}
        ry={6}
        fill="var(--fp-plant-light)"
        opacity={0.7}
        transform="rotate(-10)"
      />
      <ellipse
        cx={3}
        cy={-1}
        rx={3}
        ry={6}
        fill="var(--fp-plant-light)"
        opacity={0.7}
        transform="rotate(10)"
      />
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
      <rect
        x={-16}
        y={-12}
        width={32}
        height={24}
        rx={2}
        fill="var(--fp-desk-body)"
        stroke="var(--fp-furniture-stroke)"
        strokeWidth={0.5}
      />
      <rect
        x={-16}
        y={-12}
        width={32}
        height={2}
        rx={1}
        fill="var(--fp-desk-body-light)"
        opacity={0.5}
      />
      <rect x={-7} y={-10} width={14} height={10} rx={1} fill="var(--fp-desk-top)" />
      <rect
        x={-3}
        y={-6}
        width={6}
        height={4}
        rx={0.5}
        fill="var(--fp-desk-detail)"
        opacity={0.5}
      />
      <rect x={-6} y={0} width={12} height={3} rx={0.8} fill="var(--fp-desk-paper)" />
      <ellipse cx={8} cy={1} rx={2} ry={1.5} fill="var(--fp-desk-paper)" />
      <ellipse cx={0} cy={16} rx={7} ry={5} fill="var(--fp-desk-screen-off)" />
      <rect x={-5} y={14} width={10} height={5} rx={2} fill="var(--fp-desk-screen-off)" />
      {hasPaper && (
        <rect
          x={-14}
          y={-8}
          width={4}
          height={5}
          rx={0.5}
          fill="#f5f5dc"
          opacity={0.7}
        />
      )}
      {hasPlant && (
        <g transform={`translate(${plantLeft ? -13 : 13}, ${7})`}>
          <rect x={-2} y={-1} width={4} height={4} rx={1} fill="var(--fp-plant-pot)" />
          <ellipse cx={0} cy={-3} rx={2} ry={4} fill="var(--fp-plant-dark)" opacity={0.9} />
          <ellipse
            cx={-1}
            cy={-4}
            rx={1.5}
            ry={3}
            fill="var(--fp-plant-mid)"
            opacity={0.8}
          />
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
      <rect
        x={-2}
        y={0}
        width={seatW + 8}
        height={totalH}
        rx={4}
        fill="var(--fp-chair-body)"
        stroke="var(--fp-chair-body-stroke)"
        strokeWidth={0.5}
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={3}
          y={arm + i * (seatH + gap)}
          width={seatW}
          height={seatH}
          rx={3}
          fill="var(--fp-chair-seat)"
          stroke="var(--fp-chair-seat-stroke)"
          strokeWidth={0.3}
        />
      ))}
      <rect x={-2} y={0} width={seatW + 8} height={arm} rx={2} fill="var(--fp-chair-arm)" />
      <rect
        x={-2}
        y={totalH - arm}
        width={seatW + 8}
        height={arm}
        rx={2}
        fill="var(--fp-chair-arm)"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={5}
          y={arm + i * (seatH + gap) + 1}
          width={seatW - 4}
          height={5}
          rx={2}
          fill="var(--fp-chair-cushion)"
          opacity={0.5}
        />
      ))}
    </g>
  );
}

function CoffeeTableIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-18}
        y={-16}
        width={36}
        height={32}
        rx={3}
        fill="var(--fp-desk-surface)"
        stroke="var(--fp-furniture-stroke)"
        strokeWidth={0.5}
      />
      <rect
        x={-16}
        y={-14}
        width={32}
        height={28}
        rx={2}
        fill="var(--fp-desk-surface-inner)"
        opacity={0.4}
      />
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
      fill="var(--fp-rug-fill)"
      stroke="var(--fp-rug-stroke)"
      strokeWidth={0.5}
    />
  );
}

function WaterDispenserIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-6}
        y={-14}
        width={12}
        height={20}
        rx={4}
        fill="var(--fp-water-body)"
        opacity={0.4}
      />
      <circle cx={0} cy={-14} r={4} fill="var(--fp-water-body)" opacity={0.3} />
      <rect x={-8} y={6} width={16} height={5} rx={2} fill="var(--fp-water-base)" />
      <rect
        x={-2}
        y={-20}
        width={4}
        height={5}
        rx={1}
        fill="rgba(255,255,255,0.1)"
      />
    </g>
  );
}

function WallLine({
  x1,
  y1,
  x2,
  y2,
  outer,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  outer?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={outer ? "var(--fp-wall-outer)" : "var(--fp-wall-inner)"}
      strokeWidth={outer ? 2.5 : 1.5}
      strokeLinecap="round"
    />
  );
}

function WindowIcon({
  x,
  y,
  w,
  h,
  horizontal,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  horizontal?: boolean;
}) {
  if (horizontal) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1}
          fill="#1e3a5f"
          opacity={0.6}
        />
        <rect
          x={x + 2}
          y={y + 1}
          width={w - 4}
          height={h - 2}
          rx={1}
          fill="#2563eb"
          opacity={0.25}
        />
        <line
          x1={x + w / 2}
          y1={y + 1}
          x2={x + w / 2}
          y2={y + h - 1}
          stroke="var(--fp-door-stroke)"
          strokeWidth={0.5}
        />
      </g>
    );
  }
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={1}
        fill="#1e3a5f"
        opacity={0.6}
      />
      <rect
        x={x + 1}
        y={y + 2}
        width={w - 2}
        height={h - 4}
        rx={1}
        fill="#2563eb"
        opacity={0.25}
      />
      <line
        x1={x + 1}
        y1={y + h / 2}
        x2={x + w - 1}
        y2={y + h / 2}
        stroke="var(--fp-door-stroke)"
        strokeWidth={0.5}
      />
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
        fill="var(--fp-door-fill)"
        stroke="var(--fp-door-stroke)"
        strokeWidth={1}
      />
    );
  }
  return (
    <g>
      {swingUp && (
        <rect
          x={hingeLeft ? x + 2 : x + w - 4}
          y={y - h + 4}
          width={4}
          height={h}
          rx={1}
          fill="var(--fp-door-swing)"
          stroke="var(--fp-furniture-stroke)"
          strokeWidth={0.6}
        />
      )}
      <path
        d={
          hingeLeft && swingUp
            ? `M ${x + 2} ${y + h} A ${w} ${h} 0 0 1 ${x + w} ${y}`
            : `M ${x + w - 2} ${y + h} A ${w} ${h} 0 0 0 ${x} ${y}`
        }
        fill="none"
        stroke="var(--fp-door-swing)"
        strokeWidth={0.8}
        strokeDasharray="3 3"
      />
    </g>
  );
}

export function FloorPlan({ devices }: Props) {
  const isOfficeOpen = devices.some((d) => d.status === "on");
  return (
    <div className="h-full rounded-4xl bg-glass-bg p-1.5 ring-1 ring-glass-border">
      <div className="card-surface relative flex h-full flex-col overflow-hidden rounded-[1.625rem] bg-onyx p-5">
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-accent-purple-dim blur-3xl" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Office Floor Plan
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="shrink-0"
              >
                <circle cx="6" cy="6" r="5" fill="#facc15" opacity={0.15} />
                <circle cx="6" cy="6" r="3" fill="#facc15" />
              </svg>
              <span className="text-[10px] font-medium text-text-tertiary">
                Lights
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="shrink-0"
              >
                {[0, 120, 240].map((a) => (
                  <ellipse
                    key={a}
                    cx={6}
                    cy={2.5}
                    rx={1.2}
                    ry={3.5}
                    fill="#c8953a"
                    opacity={0.8}
                    transform={`rotate(${a}, 6, 6)`}
                  />
                ))}
                <circle cx="6" cy="6" r="1.5" fill="#d4a84a" />
              </svg>
              <span className="text-[10px] font-medium text-text-tertiary">
                Fans
              </span>
            </div>
          </div>
        </div>

        {/* SVG Floor Plan */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden overflow-x-auto rounded-2xl border-2 border-orange-50 dark:border-[rgba(180,160,130,0.08)]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x={0}
              y={0}
              width={W}
              height={H}
              rx={10}
              fill="var(--color-obsidian)"
              stroke="var(--color-glass-border)"
              strokeWidth={1.5}
            />

            {Array.from({ length: 17 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 50}
                y1={0}
                x2={i * 50}
                y2={H}
                stroke="var(--fp-grid)"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * 50}
                x2={W}
                y2={i * 50}
                stroke="var(--fp-grid)"
                strokeWidth={0.5}
              />
            ))}

            {/* Room Floors */}
            <rect
              x={0}
              y={0}
              width={sx(35)}
              height={sy(15)}
              rx={0}
              fill="var(--fp-floor-drawing)"
            />
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`dt${i}`}
                x1={i * (sx(35) / 6)}
                y1={0}
                x2={i * (sx(35) / 6)}
                y2={sy(15)}
                stroke="var(--fp-floor-drawing-line)"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`dh${i}`}
                x1={0}
                y1={i * (sy(15) / 10)}
                x2={sx(35)}
                y2={i * (sy(15) / 10)}
                stroke="var(--fp-floor-drawing-line)"
                strokeWidth={0.5}
              />
            ))}

            <rect
              x={sx(35)}
              y={0}
              width={sx(31)}
              height={sy(15)}
              rx={0}
              fill="var(--fp-floor-work1)"
            />
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`w1v${i}`}
                x1={sx(35) + i * (sx(31) / 5)}
                y1={0}
                x2={sx(35) + i * (sx(31) / 5)}
                y2={sy(15)}
                stroke="var(--fp-floor-work1-line)"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`w1h${i}`}
                x1={sx(35)}
                y1={i * (sy(15) / 10)}
                x2={sx(66)}
                y2={i * (sy(15) / 10)}
                stroke="var(--fp-floor-work1-line)"
                strokeWidth={0.5}
              />
            ))}

            <rect
              x={sx(66)}
              y={0}
              width={sx(34)}
              height={sy(15)}
              rx={0}
              fill="var(--fp-floor-work2)"
            />
            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={`w2h${i}`}
                x1={sx(66)}
                y1={i * (sy(15) / 18)}
                x2={W}
                y2={i * (sy(15) / 18)}
                stroke="var(--fp-floor-work2-line)"
                strokeWidth={0.5}
              />
            ))}

            <rect
              x={0}
              y={sy(15)}
              width={W}
              height={sy(0) - sy(15)}
              rx={0}
              fill="var(--fp-floor-hallway)"
            />

            <rect
              x={0}
              y={0}
              width={sx(35)}
              height={sy(15)}
              rx={8}
              fill="none"
              stroke="var(--fp-room-border)"
              strokeWidth={1}
            />
            <rect
              x={sx(35)}
              y={0}
              width={sx(31)}
              height={sy(15)}
              rx={8}
              fill="none"
              stroke="var(--fp-room-border)"
              strokeWidth={1}
            />
            <rect
              x={sx(66)}
              y={0}
              width={sx(34)}
              height={sy(15)}
              rx={8}
              fill="none"
              stroke="var(--fp-room-border)"
              strokeWidth={1}
            />

            <text
              x={sx(17.5)}
              y={sy(95)}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-text-secondary)"
              fontWeight={600}
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              DRAWING ROOM
            </text>
            <text
              x={sx(50.5)}
              y={sy(95)}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-text-secondary)"
              fontWeight={600}
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              WORK ROOM 1
            </text>
            <text
              x={sx(83)}
              y={sy(95)}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-text-secondary)"
              fontWeight={600}
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              WORK ROOM 2
            </text>
            <text
              x={sx(30)}
              y={sy(7)}
              textAnchor="middle"
              fontSize={8}
              fill="var(--color-slate-mid)"
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              HALLWAY / CORRIDOR
            </text>

            {/* <WallLine x1={0} y1={0} x2={W} y2={0} outer /> */}
            {/* <WallLine x1={0} y1={0} x2={0} y2={H} outer /> */}
            {/* <WallLine x1={W} y1={0} x2={W} y2={H} outer /> */}
            {/* <WallLine x1={0} y1={H} x2={sx(49)} y2={H} outer /> */}
            {/* <WallLine x1={sx(55)} y1={H} x2={W} y2={H} outer /> */}

            <WallLine x1={sx(35)} y1={0} x2={sx(35)} y2={sy(15)} />
            <WallLine x1={sx(66)} y1={0} x2={sx(66)} y2={sy(15)} />

            <WallLine x1={0} y1={sy(15)} x2={sx(20.5)} y2={sy(15)} />
            <WallLine x1={sx(25.5)} y1={sy(15)} x2={sx(36.5)} y2={sy(15)} />
            <WallLine x1={sx(41.5)} y1={sy(15)} x2={sx(67.5)} y2={sy(15)} />
            <WallLine x1={sx(72.5)} y1={sy(15)} x2={W} y2={sy(15)} />

            <WindowIcon x={-2} y={sy(55)} w={4} h={40} />
            <WindowIcon x={sx(46)} y={-2} w={64} h={4} horizontal />
            <WindowIcon x={sx(76)} y={-2} w={64} h={4} horizontal />
            <WindowIcon x={W - 2} y={sy(48)} w={4} h={40} />

            <DoorIcon
              x={sx(49)}
              y={sy(0) - 16}
              w={sx(6)}
              h={16}
              hingeLeft
              swingUp
              open={isOfficeOpen}
            />
            <text
              x={sx(52)}
              y={sy(-1) + 14}
              textAnchor="middle"
              fontSize={7}
              fill="var(--color-text-tertiary)"
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              ENTRY
            </text>

            <DoorIcon
              x={sx(20.5)}
              y={sy(15) - 14}
              w={sx(5)}
              h={14}
              hingeLeft
              swingUp
              open={isOfficeOpen}
            />
            <DoorIcon
              x={sx(36.5)}
              y={sy(15) - 14}
              w={sx(5)}
              h={14}
              hingeLeft={false}
              swingUp
              open={isOfficeOpen}
            />
            <DoorIcon
              x={sx(67.5)}
              y={sy(15) - 14}
              w={sx(5)}
              h={14}
              hingeLeft={false}
              swingUp
              open={isOfficeOpen}
            />

            <PlantIcon x={sx(5)} y={sy(5)} />
            <PlantIcon x={sx(87)} y={sy(5)} />
            <WaterDispenserIcon x={sx(93)} y={sy(5)} />
            <line
              x1={sx(91)}
              y1={sy(8)}
              x2={sx(91)}
              y2={sy(2)}
              stroke="var(--fp-wall-line)"
              strokeWidth={1.5}
            />

            <RugIcon x={sx(12)} y={sy(62)} />
            <CoffeeTableIcon x={sx(17)} y={sy(55)} />
            <SofaIcon x={sx(5)} y={sy(75)} />

            <PlantIcon x={sx(5)} y={sy(95)} />
            <PlantIcon x={sx(31)} y={sy(23)} />

            <FanIcon
              x={sx(20)}
              y={sy(85)}
              on={getDeviceStatus(devices, "drawing-fan-1")}
            />
            <FanIcon
              x={sx(20)}
              y={sy(35)}
              on={getDeviceStatus(devices, "drawing-fan-2")}
            />
            <LightIcon
              x={sx(11)}
              y={sy(88)}
              on={getDeviceStatus(devices, "drawing-light-1")}
            />
            <LightIcon
              x={sx(29)}
              y={sy(88)}
              on={getDeviceStatus(devices, "drawing-light-2")}
            />
            <LightIcon
              x={sx(18)}
              y={sy(25)}
              on={getDeviceStatus(devices, "drawing-light-3")}
            />

            <DeskIcon x={sx(41)} y={sy(70)} hasPaper />
            <DeskIcon x={sx(60)} y={sy(70)} hasPaper />
            <DeskIcon x={sx(41)} y={sy(50)} hasPlant plantLeft />
            <DeskIcon x={sx(60)} y={sy(50)} hasPlant plantLeft={false} />

            <FanIcon
              x={sx(51)}
              y={sy(85)}
              on={getDeviceStatus(devices, "work1-fan-1")}
            />
            <FanIcon
              x={sx(51)}
              y={sy(45)}
              on={getDeviceStatus(devices, "work1-fan-2")}
            />
            <LightIcon
              x={sx(43)}
              y={sy(88)}
              on={getDeviceStatus(devices, "work1-light-1")}
            />
            <LightIcon
              x={sx(59)}
              y={sy(88)}
              on={getDeviceStatus(devices, "work1-light-2")}
            />
            <LightIcon
              x={sx(51)}
              y={sy(22)}
              on={getDeviceStatus(devices, "work1-light-3")}
            />

            <DeskIcon x={sx(72)} y={sy(70)} hasPlant plantLeft />
            <DeskIcon
              x={sx(91)}
              y={sy(70)}
              hasPaper
              hasPlant
              plantLeft={false}
            />
            <DeskIcon x={sx(72)} y={sy(50)} hasPlant plantLeft />
            <DeskIcon x={sx(91)} y={sy(50)} hasPlant plantLeft={false} />

            <FanIcon
              x={sx(82)}
              y={sy(85)}
              on={getDeviceStatus(devices, "work2-fan-1")}
            />
            <FanIcon
              x={sx(82)}
              y={sy(45)}
              on={getDeviceStatus(devices, "work2-fan-2")}
            />
            <LightIcon
              x={sx(74)}
              y={sy(88)}
              on={getDeviceStatus(devices, "work2-light-1")}
            />
            <LightIcon
              x={sx(90)}
              y={sy(88)}
              on={getDeviceStatus(devices, "work2-light-2")}
            />
            <LightIcon
              x={sx(82)}
              y={sy(22)}
              on={getDeviceStatus(devices, "work2-light-3")}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
