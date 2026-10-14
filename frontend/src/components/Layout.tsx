import React, { useState } from "react";
import { Student, PageId } from "../types";
import { Sidebar, navItems } from "./Sidebar";
import { Topbar } from "./Topbar";

interface LayoutProps {
  student: Student;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  student,
  activePage,
  onNavigate,
  onLogout,
  children
}) => {
  const [mobileNav, setMobileNav] = useState(false);

  const activeItem = navItems.find((n) => n.id === activePage) || {
    id: activePage,
    icon: "◉",
    label: activePage === "profile" ? "Student Profile" : "Dashboard"
  };

  return (
    <div className="app-shell">
      <Sidebar
        student={student}
        activePage={activePage}
        onNavigate={onNavigate}
        mobileNav={mobileNav}
        onCloseMobileNav={() => setMobileNav(false)}
        onLogout={onLogout}
      />

      <main className="main-area">
        <Topbar
          student={student}
          activeTitle={activeItem.label}
          onOpenMobileNav={() => setMobileNav(true)}
        />

        <div className="page-content">
          {children}
          <footer className="page-footer">
            MLR Student Portal <span>•</span> MLR Institute of Technology (Autonomous) <span>•</span> SQLite Real-time Backend
          </footer>
        </div>
      </main>
    </div>
  );
};
