"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  // Start with null to avoid hydration mismatch — we read the real value after mount
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Read the actual DOM state set by the inline script in layout.tsx
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    // Toggle the class on <html> — Tailwind v4 @custom-variant dark reads this
    document.documentElement.classList.toggle("dark", next);
    // Persist preference
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Don't render until we know the actual theme (avoids icon flash)
  if (isDark === null) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle dark/light mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}
