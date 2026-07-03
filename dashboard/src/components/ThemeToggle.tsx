import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-glass-border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:ring-accent-emerald/30"
    >
      <span className="absolute inset-0 rounded-full bg-glass-bg transition-all duration-500 group-hover:bg-accent-emerald-dim" />
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          className="relative h-3.5 w-3.5 text-text-secondary transition-all duration-500 group-hover:text-accent-emerald group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="relative h-3.5 w-3.5 text-text-secondary transition-all duration-500 group-hover:text-accent-amber group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
}
