import React, { useState, useEffect } from "react";
import { Student, PageId, BgTheme } from "./types";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AttendancePage } from "./pages/AttendancePage";
import { MarksPage } from "./pages/MarksPage";
import { StatusPage } from "./pages/StatusPage";
import { DownloadsPage } from "./pages/DownloadsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { TimetablePage } from "./pages/TimetablePage";
import { checkSession } from "./services/api";
import "./App.css";

export const App: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Student | null>(null);
  const [page, setPage] = useState<PageId>("home");
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [theme, setTheme] = useState<BgTheme>(() => {
    return (localStorage.getItem("mlr_portal_bg") as BgTheme) || "midnight";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bg-theme", theme);
    localStorage.setItem("mlr_portal_bg", theme);
  }, [theme]);

  // Restore session from localStorage if present
  useEffect(() => {
    const savedRoll = localStorage.getItem("mlr_portal_roll");
    if (savedRoll) {
      checkSession(savedRoll)
        .then((st: Student) => {
          setStudent(st);
        })
        .catch(() => {
          localStorage.removeItem("mlr_portal_roll");
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (st: Student) => {
    setStudent(st);
    setPage("home");
    localStorage.setItem("mlr_portal_roll", st.roll);
  };

  const handleLogout = () => {
    setStudent(null);
    setSelectedProfile(null);
    setPage("home");
    localStorage.removeItem("mlr_portal_roll");
  };

  if (checkingAuth) {
    return (
      <main className="login-screen" style={{ color: "var(--navy)" }}>
        <p>Connecting to MLR Student Portal SQLite backend...</p>
      </main>
    );
  }

  if (!student) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    );
  }

  let content: React.ReactNode;
  if (page === "students") {
    content = (
      <StudentsPage
        onViewStudent={(selected) => {
          setSelectedProfile(selected);
          setPage("profile");
        }}
      />
    );
  } else if (page === "profile") {
    content = (
      <StudentProfilePage
        student={selectedProfile || student}
        onBack={() => setPage("students")}
      />
    );
  } else if (page === "attendance") {
    content = <AttendancePage student={student} />;
  } else if (page === "timetable") {
    content = <TimetablePage student={student} />;
  } else if (page === "marks") {
    content = <MarksPage student={student} />;
  } else if (page === "status") {
    content = <StatusPage student={student} />;
  } else if (page === "downloads") {
    content = <DownloadsPage student={student} />;
  } else {
    content = <DashboardPage student={student} onNavigate={setPage} />;
  }

  return (
    <Layout
      student={student}
      activePage={page}
      onNavigate={setPage}
      onLogout={handleLogout}
      currentTheme={theme}
      onThemeChange={setTheme}
    >
      {content}
    </Layout>
  );
};

export default App;
