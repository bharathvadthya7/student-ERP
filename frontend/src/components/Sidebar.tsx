import React from "react";
import { Student, PageId, NavItem } from "../types";

export const navItems: NavItem[] = [
  { id: "home", icon: "⌂", label: "Dashboard" },
  { id: "timetable", icon: "◷", label: "Class Timetable" },
  { id: "attendance", icon: "▦", label: "Attendance" },
  { id: "marks", icon: "▤", label: "Marks & Results" },
  { id: "status", icon: "◉", label: "Student Status" },
  { id: "downloads", icon: "⇩", label: "Downloads" },
  { id: "students", icon: "♙", label: "Class Directory" }
];

interface SidebarProps {
  student: Student;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  mobileNav: boolean;
  onCloseMobileNav: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  student,
  activePage,
  onNavigate,
  mobileNav,
  onCloseMobileNav,
  onLogout
}) => {
  return (
    <>
      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={onCloseMobileNav}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MLR PORTAL</strong>
            <span>STUDENT SERVICES</span>
          </div>
          <button
            className="mobile-close"
            onClick={onCloseMobileNav}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="sidebar-label">MAIN MENU</div>
        <nav>
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${activePage === n.id ? "active" : ""}`}
              onClick={() => {
                onNavigate(n.id);
                onCloseMobileNav();
              }}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {activePage === n.id && <span className="active-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {student.first?.[0] || "S"}
              {student.surname?.[0] || student.first?.[1] || "T"}
            </div>
            <div className="user-info">
              <strong>{student.fullName}</strong>
              <span>{student.roll} &nbsp;•&nbsp; {student.section}</span>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <span>↪</span> Log out
          </button>
          <div className="sidebar-footnote">MLRIT CSE-G · 2026-27</div>
        </div>
      </aside>
    </>
  );
};
