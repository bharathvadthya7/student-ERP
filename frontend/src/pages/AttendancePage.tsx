import React, { useEffect, useState, useCallback } from "react";
import { Student, AttendanceRecord, AttendanceStats, TimetableSlot, SubjectAttendance, ClassInfo } from "../types";
import { StatCard } from "../components/StatCard";
import { getAttendanceData, toggleDayAttendance } from "../services/api";

interface AttendancePageProps {
  student: Student;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ student }) => {
  const [month, setMonth] = useState<number>(8); // September (0-indexed 8)
  const [year, setYear] = useState<number>(2026);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateMsg, setUpdateMsg] = useState<string>("");

  const loadData = useCallback(() => {
    setLoading(true);
    getAttendanceData(student.id, month, year)
      .then((data) => {
        setRecords(data.records);
        setSubjects(data.subjectAttendance);
        setStats(data.stats);
        setClassInfo(data.classInfo);
        setTimetable(data.timetable);
      })
      .catch((err) => console.error("Error loading attendance:", err))
      .finally(() => setLoading(false));
  }, [student.id, month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDayClick = async (record: AttendanceRecord) => {
    if (record.status === "weekend") return;

    const nextStatus = record.status === "present" ? "absent" : "present";
    try {
      await toggleDayAttendance(student.id, record.date, nextStatus);
      setUpdateMsg(`Updated ${record.date} to ${nextStatus.toUpperCase()} in SQLite database.`);
      setTimeout(() => setUpdateMsg(""), 3500);
      loadData();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const monthLabel = new Date(year, month).toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });

  const overallPct = stats?.overallAttendance ?? student.attendance;
  const isEligible = overallPct >= 75.0;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {classInfo?.branch || "CSE"} · {classInfo?.yearSem || "II/I Sem"} ({classInfo?.section || "Section - G"})
          </span>
          <h1>Attendance Register</h1>
          <p>
            Official attendance records verified by Class Incharge <strong>{classInfo?.classIncharge || "Mrs. T. Sai Priyanka"}</strong>.
          </p>
        </div>
        <span className={`pill ${isEligible ? "green" : "red"}`}>
          {isEligible ? "Eligible for Exams (≥ 75%)" : "Condonation Required (< 75%)"}
        </span>
      </div>

      {updateMsg && (
        <div className="notice" role="status" style={{ marginBottom: "16px" }}>
          ✓ {updateMsg}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon="◉"
          label="Overall Attendance"
          value={`${overallPct}%`}
          detail={isEligible ? "Meets university threshold" : "Below 75% condonation rule"}
          color={isEligible ? "blue" : "orange"}
        />
        <StatCard
          icon="✓"
          label="Total Classes Attended"
          value={`${stats?.totalAttended ?? student.totalAttended}`}
          detail={`Out of ${stats?.totalConducted ?? student.totalConducted} conducted`}
          color="green"
        />
        <StatCard
          icon="×"
          label="Classes Missed"
          value={(stats?.totalConducted ?? student.totalConducted) - (stats?.totalAttended ?? student.totalAttended)}
          detail="Official attendance statement"
          color="orange"
        />
        <StatCard
          icon="№"
          label="Class Standing"
          value={`Rank #${student.deptRank}`}
          detail={`Out of 69 students in CSE-G`}
          color="purple"
        />
      </div>

      {/* Official Subject-wise Attendance Table from Document */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Subject-wise Attendance Breakdown</h2>
            <p>
              Exact attendance per course component as recorded in the MLRIT institutional ledger (Date: 16-09-2026 To 30-09-2026).
            </p>
          </div>
          <span className="pill blue">{subjects.length} Courses</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Key</th>
                <th>Subject Title</th>
                <th style={{ textAlign: "center" }}>Conducted (C)</th>
                <th style={{ textAlign: "center" }}>Attended (A)</th>
                <th style={{ textAlign: "center" }}>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => {
                const isSubEligible = sub.percentage >= 75.0 || sub.conducted === 0;
                return (
                  <tr key={sub.id}>
                    <td><strong>{sub.subject_code}</strong></td>
                    <td><span className="pill blue">{sub.subject_key}</span></td>
                    <td className="subject-name">{sub.subject_name}</td>
                    <td style={{ textAlign: "center" }}><strong>{sub.conducted}</strong></td>
                    <td style={{ textAlign: "center" }}><strong>{sub.attended}</strong></td>
                    <td style={{ textAlign: "center" }}>
                      <strong>{sub.conducted > 0 ? `${sub.percentage.toFixed(2)}%` : "N/A"}</strong>
                    </td>
                    <td>
                      <span className={`pill ${isSubEligible ? "green" : "red"}`}>
                        {sub.conducted === 0 ? "Exempted" : isSubEligible ? "Good (≥ 75%)" : "Low (< 75%)"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f8faff", fontWeight: 700 }}>
                <td colSpan={3}>TOTAL CUMULATIVE ATTENDANCE</td>
                <td style={{ textAlign: "center" }}>{stats?.totalConducted ?? student.totalConducted}</td>
                <td style={{ textAlign: "center" }}>{stats?.totalAttended ?? student.totalAttended}</td>
                <td style={{ textAlign: "center", color: isEligible ? "#218838" : "#c82333" }}>
                  {overallPct}%
                </td>
                <td>
                  <span className={`pill ${isEligible ? "green" : "red"}`}>
                    {isEligible ? "Cleared" : "Warning"}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Monthly Interactive Calendar */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Daily Calendar View</h2>
            <p>Click on any weekday to live toggle attendance between Present and Absent in the SQLite database.</p>
          </div>
          <div className="month-controls">
            <button className="icon-button" onClick={handlePrevMonth} aria-label="Previous month">‹</button>
            <strong>{monthLabel}</strong>
            <button className="icon-button" onClick={handleNextMonth} aria-label="Next month">›</button>
          </div>
        </div>

        <div className="calendar">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div className="calendar-weekday" key={d}>
              {d}
            </div>
          ))}

          {records.length > 0 &&
            Array.from({ length: records[0].weekday }, (_, i) => (
              <div key={`blank-${i}`} />
            ))}

          {records.map((r) => (
            <div
              key={r.day}
              className={`calendar-day ${r.status}`}
              title={`${r.date} — Status: ${r.status} (Click to toggle)`}
              onClick={() => handleDayClick(r)}
              style={{ cursor: r.status === "weekend" ? "default" : "pointer" }}
            >
              {r.day}
            </div>
          ))}
        </div>

        <div className="legend">
          <span><i className="dot present" />Present</span>
          <span><i className="dot absent" />Absent</span>
          <span><i className="dot weekend" />Weekend</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--muted)" }}>
            💡 Tip: Click any weekday to live toggle day status in SQLite
          </span>
        </div>
      </section>

      {timetable.length > 0 && (
        <section className="panel">
          <h2>Today's Class Schedule ({student.section})</h2>
          <p className="muted">Live lecture schedule for current semester.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Course Subject</th>
                  <th>Faculty Instructor</th>
                  <th>Room</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((t, idx) => (
                  <tr key={t.id}>
                    <td><strong>{t.time_slot}</strong></td>
                    <td>{t.subject}</td>
                    <td>{t.faculty}</td>
                    <td>{t.room}</td>
                    <td>
                      <span className={`pill ${idx % 2 === 0 ? "green" : "blue"}`}>
                        {idx % 2 === 0 ? "Present" : "Marked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
};
