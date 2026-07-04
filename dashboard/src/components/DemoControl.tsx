import { useState, useCallback, useEffect } from "react";
import { triggerScenario, fetchOfficeHours, updateOfficeHours } from "../api/ws";

const SCENARIOS = [
  { id: "normal", label: "Normal", icon: "\u2699\ufe0f", desc: "Resume auto-simulation" },
  { id: "all-on", label: "All On", icon: "\u26a1", desc: "Every device ON" },
  { id: "energy-saver", label: "All Off", icon: "\ud83d\udd0c", desc: "Every device OFF" },
  { id: "lunch-break", label: "Lunch", icon: "\ud83c\udf5c", desc: "Work rooms off, lobby on" },
  { id: "after-hours-forgotten", label: "Forgotten", icon: "\ud83d\ude34", desc: "Simulate after-hours waste" },
];

interface Props {
  activeScenario: string | null;
}

export function DemoControl({ activeScenario }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [openHour, setOpenHour] = useState(9);
  const [closeHour, setCloseHour] = useState(17);

  useEffect(() => {
    fetchOfficeHours().then((data) => {
      if (data) {
        setOpenHour(data.open_hour);
        setCloseHour(data.close_hour);
      }
    });
  }, []);

  const handleScenario = useCallback(async (id: string) => {
    setLoading(true);
    await triggerScenario(id);
    setLoading(false);
    setIsOpen(false);
  }, []);

  const handleHoursSave = useCallback(async () => {
    setLoading(true);
    const ok = await updateOfficeHours(openHour, closeHour);
    if (ok) setShowHours(false);
    setLoading(false);
  }, [openHour, closeHour]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-64 rounded-2xl bg-onyx/95 p-2 ring-1 ring-glass-border shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Demo Scenarios
          </p>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleScenario(s.id)}
              disabled={loading}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 hover:bg-glass-bg ${
                activeScenario === s.id ? "ring-1 ring-accent-emerald/30 bg-accent-emerald-dim" : ""
              }`}
            >
              <span className="text-base">{s.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary">{s.label}</p>
                <p className="text-[10px] text-text-tertiary">{s.desc}</p>
              </div>
            </button>
          ))}

          {/* Divider */}
          <div className="my-2 border-t border-glass-border" />

          {/* Office Hours */}
          <button
            onClick={() => setShowHours(!showHours)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 hover:bg-glass-bg"
          >
            <span className="text-base">{"\ud83d\udd52"}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary">Office Hours</p>
              <p className="text-[10px] text-text-tertiary">
                {String(openHour).padStart(2, "0")}:00 — {String(closeHour).padStart(2, "0")}:00
              </p>
            </div>
          </button>

          {showHours && (
            <div className="mx-3 mb-2 rounded-xl bg-glass-bg p-3 ring-1 ring-glass-border">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-[10px] font-medium text-text-tertiary">Open</label>
                <select
                  value={openHour}
                  onChange={(e) => setOpenHour(Number(e.target.value))}
                  className="rounded-lg bg-onyx px-2 py-1 text-xs text-text-primary ring-1 ring-glass-border focus:outline-none focus:ring-accent-emerald/50"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-[10px] font-medium text-text-tertiary">Close</label>
                <select
                  value={closeHour}
                  onChange={(e) => setCloseHour(Number(e.target.value))}
                  className="rounded-lg bg-onyx px-2 py-1 text-xs text-text-primary ring-1 ring-glass-border focus:outline-none focus:ring-accent-emerald/50"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleHoursSave}
                disabled={loading}
                className="w-full rounded-lg bg-accent-emerald/20 px-3 py-1.5 text-[11px] font-semibold text-accent-emerald ring-1 ring-accent-emerald/30 transition-all hover:bg-accent-emerald/30"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-glass-border transition-all duration-300 ${
          isOpen
            ? "bg-accent-purple rotate-45 ring-accent-purple/30 [&>svg]:fill-white"
            : activeScenario
              ? "bg-accent-emerald/20 ring-accent-emerald/30 hover:bg-accent-emerald/30"
              : "bg-onyx/90 hover:bg-onyx"
        }`}
        title="Demo Mode"
      >
        {activeScenario ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent-emerald" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-text-secondary transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}
