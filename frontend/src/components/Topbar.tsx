import React from "react";
import { Student } from "../types";

interface TopbarProps {
  student: Student;
  activeTitle: string;
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  student,
  activeTitle,
  onOpenMobileNav
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
        <span className="demo-badge">
          <i /> CSE-G Live Database
        </span>
        <div className="top-avatar">
          {student.first?.[0] || "S"}
          {student.surname?.[0] || student.first?.[1] || "T"}
        </div>
      </div>
    </header>
  );
};
