import React from "react";
import { Student, BgTheme } from "../types";

interface TopbarProps {
  student: Student;
  activeTitle: string;
  onOpenMobileNav: () => void;
  currentTheme: BgTheme;
  onThemeChange: (theme: BgTheme) => void;
}

const themes: { id: BgTheme; label: string; icon: string }[] = [
  { id: "midnight", label: "Midnight", icon: "🌌" },
  { id: "aurora", label: "Aurora", icon: "✨" },
  { id: "royal", label: "Royal", icon: "🎓" },
  { id: "light", label: "Daylight", icon: "☀️" }
];

export const Topbar: React.FC<TopbarProps> = ({
  student,
  activeTitle,
  onOpenMobileNav,
  currentTheme,
  onThemeChange
}) => {
  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <div className="breadcrumb">
        Student Portal <span>/</span> <strong>{activeTitle}</strong>
      </div>

      <div className="topbar-right">
        <div className="theme-switcher" role="group" aria-label="Select Background Style">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-pill ${currentTheme === t.id ? "active" : ""}`}
              onClick={() => onThemeChange(t.id)}
              title={`Switch to ${t.label} background`}
            >
              <span className="theme-icon">{t.icon}</span>
              <span className="theme-label">{t.label}</span>
            </button>
          ))}
        </div>

        <span className="demo-badge">
          <i /> CSE-G Live
        </span>
        <div className="top-avatar">
          {student.first?.[0] || "S"}
          {student.surname?.[0] || student.first?.[1] || "T"}
        </div>
      </div>
    </header>
  );
};
