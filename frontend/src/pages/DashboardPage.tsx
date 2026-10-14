import React, { useEffect, useState } from "react";
import { Student, PageId, Announcement, TimetableSlot, SubjectAttendance, ClassInfo } from "../types";
import { StatCard } from "../components/StatCard";
import { navItems } from "../components/Sidebar";
import { getDashboardData } from "../services/api";

interface DashboardPageProps {
  student: Student;
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ student, onNavigate }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getDashboardData(student.id)
      .then((data) => {
        if (!isMounted) return;
        setAnnouncements(data.announcements);
        setTimetable(data.timetable);
        setSubjects(data.subjectAttendance || []);
        setClassInfo(data.classInfo);
        setPendingCount(data.stats.pendingClearances);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [student.id]);

  const isEligible = student.attendance >= 75.0;

  return (
    <>
      <div className="welcome-banner">
        <div>
          <span className="eyebrow">
            {classInfo?.branch || "COMPUTER SCIENCE & ENGINEERING"} · {classInfo?.yearSem || "II/I SEM"} ({classInfo?.section || "SECTION - G"})
          </span>
          <h1>Welcome, {student.first}!</h1>
          <p>
            Official student record verified by Class Incharge <strong>{classInfo?.classIncharge || "Mrs. T. Sai Priyanka"}</strong>.
          </p>
        </div>
        <div className="avatar-large">
          {student.first[0]}
          {student.surname[0]}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="◉"
          label="Overall Attendance"
          value={`${student.attendance}%`}
          detail={isEligible ? "Meets 75% examination threshold" : "Below 75% condonation threshold"}
          color={isEligible ? "blue" : "orange"}
        />
        <StatCard
          icon="✓"
          label="Classes Attended"
          value={`${student.totalAttended}`}
          detail={`Out of ${student.totalConducted} conducted`}
          color="green"
        />
        <StatCard
          icon="★"
          label="Cumulative CGPA"
          value={student.cgpa}
          detail="Graded on 10.0 scale"
          color="purple"
        />
        <StatCard
          icon="№"
          label="Section Standing"
          value={`Rank #${student.deptRank}`}
          detail={`Out of 69 students in CSE-G`}
          color={student.deptRank <= 10 ? "green" : "blue"}
        />
      </div>

      {/* Student Profile Overview */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Academic Credentials</h2>
            <p>Official institutional enrollment data.</p>
          </div>
          <span className="pill blue">CSE-G Regular Active</span>
        </div>

        <div className="profile-layout">
          <div className="profile-avatar">
            {student.first[0]}
            {student.surname[0]}
          </div>
          <div className="details-grid">
            <div>
              <span>Full Name</span>
              <strong>{student.fullName}</strong>
            </div>
            <div>
              <span>Roll Number / Hall Ticket</span>
              <strong>{student.roll}</strong>
            </div>
            <div>
              <span>Branch & Section</span>
              <strong>{student.branch} ({student.section})</strong>
            </div>
            <div>
              <span>Semester</span>
              <strong>{student.yearSem || "II/I Sem"} ({student.academicYear})</strong>
            </div>
            <div>
              <span>Class Incharge</span>
              <strong>{student.classIncharge || "Mrs. T. Sai Priyanka"}</strong>
            </div>
            <div>
              <span>Clearance Standing</span>
              <strong style={{ color: isEligible ? "#218838" : "#c82333" }}>
                {isEligible ? "Eligible for Examinations" : "Condonation Required"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Subject Attendance Snapshot */}
      {subjects.length > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Course Attendance Summary</h2>
              <p>Current semester subject-wise attendance sheet.</p>
            </div>
            <button className="button button-secondary" onClick={() => onNavigate("attendance")}>
              View Full Register →
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject Key</th>
                  <th>Course Title</th>
                  <th style={{ textAlign: "center" }}>Conducted</th>
                  <th style={{ textAlign: "center" }}>Attended</th>
                  <th style={{ textAlign: "center" }}>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.slice(0, 6).map((sub) => {
                  const subOk = sub.percentage >= 75.0 || sub.conducted === 0;
                  return (
                    <tr key={sub.id}>
                      <td><span className="pill blue">{sub.subject_key}</span></td>
                      <td className="subject-name">{sub.subject_name}</td>
                      <td style={{ textAlign: "center" }}>{sub.conducted}</td>
                      <td style={{ textAlign: "center" }}>{sub.attended}</td>
                      <td style={{ textAlign: "center" }}>
                        <strong>{sub.conducted > 0 ? `${sub.percentage.toFixed(1)}%` : "N/A"}</strong>
                      </td>
                      <td>
                        <span className={`pill ${subOk ? "green" : "red"}`}>
                          {subOk ? "Good" : "Low"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Today's Schedule */}
      {timetable.length > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Today's Class Schedule ({student.section})</h2>
              <p>Autonomous curriculum timetable for CSE-G (Room MG 107).</p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="pill green">Live Today</span>
              <button className="button button-secondary" onClick={() => onNavigate("timetable")}>
                Full Master Timetable →
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((slot) => (
                  <tr key={slot.id}>
                    <td><strong>{slot.time_slot}</strong></td>
                    <td>{slot.subject}</td>
                    <td>{slot.faculty}</td>
                    <td><span className="pill blue">{slot.room}</span></td>
                    <td>
                      <span className={`pill ${slot.status === "Completed" ? "green" : slot.status === "Ongoing" ? "orange" : "blue"}`}>
                        {slot.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Quick Access */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Quick Access</h2>
            <p>Jump to any section.</p>
          </div>
        </div>
        <div className="quick-grid">
          {navItems
            .filter((n) => n.id !== "home")
            .map((n) => (
              <button
                className="quick-link"
                key={n.id}
                onClick={() => onNavigate(n.id)}
              >
                <span>{n.icon}</span>
                <strong>{n.label}</strong>
                <span className="quick-arrow">↗</span>
              </button>
            ))}
        </div>
      </section>

      {/* Campus Announcements */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Class Announcements</h2>
            <p>Official notices from Class Incharge & Examination Cell.</p>
          </div>
        </div>

        {announcements.map((a) => (
          <div className="announcement" key={a.id}>
            <span className={`announcement-dot ${a.type === "exam" ? "purple-dot" : ""}`} />
            <div>
              <strong>{a.title}</strong>
              <p>{a.description}</p>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>Published: {a.date}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};
