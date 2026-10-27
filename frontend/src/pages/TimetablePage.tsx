import React, { useEffect, useState } from "react";
import { Student, TimetableResponse, TimetableSlot } from "../types";
import { getTimetableData } from "../services/api";

interface TimetablePageProps {
  student: Student;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({ student }) => {
  const [data, setData] = useState<TimetableResponse | null>(null);
  const [activeDay, setActiveDay] = useState<string>("Wednesday");
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const loadTimetable = (day?: string) => {
    setLoading(true);
    getTimetableData(day)
      .then((res) => {
        setData(res);
        if (!day) {
          setActiveDay(res.currentDay);
        }
      })
      .catch((err) => console.error("Error loading timetable:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimetable();

    // Live clock update every 30 seconds
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDay = (day: string) => {
    setActiveDay(day);
    loadTimetable(day);
  };

  const currentSlots: TimetableSlot[] =
    data?.weeklyMatrix?.[activeDay] || data?.dailySchedule || [];

  const ongoingSlot = currentSlots.find((s) => s.status === "Ongoing");

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            MLRIT AUTONOMOUS · {data?.classInfo?.yearSem || "II B.Tech I Sem"} ({data?.classInfo?.section || "CSE - G"})
          </span>
          <h1>Official Class Timetable</h1>
          <p>
            Room No: <strong>{data?.classInfo?.roomNo || "MG 107"}</strong> &nbsp;•&nbsp; W.E.F: <strong>20-July-2026</strong> &nbsp;•&nbsp; Class Incharge: <strong>{data?.classInfo?.classIncharge || "Mrs T Sai Priyanka"}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="pill blue">🕒 Live Clock: {currentTimeStr}</span>
        </div>
      </div>

      {/* Real-time Ongoing Class Banner */}
      {ongoingSlot && activeDay === data?.currentDay && (
        <div
          className="notice"
          style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(16, 185, 129, 0.12))",
            borderLeft: "4px solid #22c55e",
            border: "1px solid rgba(34, 197, 94, 0.35)",
            borderRadius: "12px",
            marginBottom: "20px",
            color: "var(--text-main)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className="pill green" style={{ animation: "pulse 2s infinite" }}>
                ● ONGOING CLASS NOW
              </span>
              <h3 style={{ margin: "6px 0 2px", color: "var(--text-heading)" }}>
                Period {ongoingSlot.period}: {ongoingSlot.name} ({ongoingSlot.subject})
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                Time: <strong style={{ color: "var(--text-heading)" }}>{ongoingSlot.time_slot}</strong> &nbsp;•&nbsp; Faculty: <strong style={{ color: "var(--text-heading)" }}>{ongoingSlot.faculty}</strong> &nbsp;•&nbsp; Room/Lab: <strong style={{ color: "var(--text-heading)" }}>{ongoingSlot.room}</strong>
              </p>
            </div>
            <span className="pill blue" style={{ fontSize: "12px" }}>
              Code: {ongoingSlot.code}
            </span>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          className={`button ${viewMode === "daily" ? "button-primary" : "button-secondary"}`}
          onClick={() => setViewMode("daily")}
        >
          📅 Day-by-Day View
        </button>
        <button
          className={`button ${viewMode === "weekly" ? "button-primary" : "button-secondary"}`}
          onClick={() => setViewMode("weekly")}
        >
          ▦ Full Master Weekly Matrix (Institutional Replica)
        </button>
      </div>

      {/* DAILY VIEW */}
      {viewMode === "daily" && (
        <>
          {/* Day Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {daysList.map((day) => {
              const isToday = day === data?.currentDay;
              const isSelected = day === activeDay;
              return (
                <button
                  key={day}
                  type="button"
                  className={`pill ${isSelected ? "blue" : ""}`}
                  style={{
                    cursor: "pointer",
                    padding: "8px 16px",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: isSelected ? "1px solid var(--border-focus)" : "1px solid var(--border)",
                    background: isSelected ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "var(--surface)",
                    color: isSelected ? "#ffffff" : "var(--text-main)",
                    boxShadow: isSelected ? "0 4px 14px rgba(37, 99, 235, 0.4)" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => handleSelectDay(day)}
                >
                  {day} {isToday && "(Today)"}
                </button>
              );
            })}
          </div>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{activeDay} Schedule ({data?.classInfo?.section || "CSE-G"})</h2>
                <p>Standard class timings: Period 1 (09:10-10:20), Lunch (12:20-01:10), Period 6 ends at 04:10 PM.</p>
              </div>
              <span className="pill blue">Room: {data?.classInfo?.roomNo || "MG 107"}</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Time Slot</th>
                    <th>Subject Short</th>
                    <th>Course Code & Title</th>
                    <th>Faculty Instructor</th>
                    <th>Venue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSlots.map((slot, idx) => (
                    <React.Fragment key={slot.id || idx}>
                      {/* Render lunch break row after period 3 */}
                      {idx === 3 && (
                        <tr style={{ background: "rgba(56, 189, 248, 0.08)", fontStyle: "italic", borderTop: "1px dashed var(--border)", borderBottom: "1px dashed var(--border)" }}>
                          <td>🍽️</td>
                          <td><strong style={{ color: "var(--navy)" }}>12:20 - 01:10</strong></td>
                          <td colSpan={4}><strong style={{ color: "var(--text-heading)", letterSpacing: "1px" }}>LUNCH BREAK</strong></td>
                          <td><span className="pill orange">Break</span></td>
                        </tr>
                      )}
                      <tr
                        style={{
                          background: slot.status === "Ongoing" && activeDay === data?.currentDay ? "rgba(34, 197, 94, 0.16)" : "inherit",
                          borderLeft: slot.status === "Ongoing" && activeDay === data?.currentDay ? "3px solid #22c55e" : "none"
                        }}
                      >
                        <td><strong>Period {slot.period}</strong></td>
                        <td>{slot.time_slot}</td>
                        <td><span className="pill blue">{slot.subject}</span></td>
                        <td>
                          <strong>{slot.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Code: {slot.code}</div>
                        </td>
                        <td>{slot.faculty}</td>
                        <td><span className="pill green">{slot.room}</span></td>
                        <td>
                          <span
                            className={`pill ${
                              slot.status === "Ongoing" && activeDay === data?.currentDay
                                ? "green"
                                : slot.status === "Completed" && activeDay === data?.currentDay
                                ? "blue"
                                : ""
                            }`}
                          >
                            {activeDay === data?.currentDay ? slot.status : "Scheduled"}
                          </span>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* WEEKLY MASTER MATRIX (Photo Replica) */}
      {viewMode === "weekly" && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Master Weekly Timetable Matrix</h2>
              <p>Replication of official MLRIT Department of Computer Science & Engineering notice board timetable.</p>
            </div>
            <span className="pill blue">CSE-G Matrix</span>
          </div>

          <div className="table-wrap">
            <table style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <th>Period / Day</th>
                  <th>
                    1<br />
                    <span style={{ fontSize: "11px", fontWeight: 400 }}>9:10-10:20</span>
                  </th>
                  <th>
                    2<br />
                    <span style={{ fontSize: "11px", fontWeight: 400 }}>10:20-11:20</span>
                  </th>
                  <th>
                    3<br />
                    <span style={{ fontSize: "11px", fontWeight: 400 }}>11:20-12:20</span>
                  </th>
                  <th style={{ background: "rgba(56, 189, 248, 0.12)", color: "var(--navy)", fontWeight: 800 }}>
                    12:20-1:10
                  </th>
                  <th>
                    4<br />
                    <span style={{ fontSize: "11px", fontWeight: 400 }}>1:10-2:10</span>
                  </th>
                  <th>
                    5<br />
                    <span style={{ fontSize: "11px", fontWeight: 400 }}>2:10-3:10</span>
                  </th>
                  <th>
                    6<br />
                    <span style={{ fontSize: "11px", fontWeight: 400 }}>3:10-4:10</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {daysList.map((dayName) => {
                  const slots = data?.weeklyMatrix?.[dayName] || [];
                  const isToday = dayName === data?.currentDay;

                  return (
                    <tr
                      key={dayName}
                      style={{
                        background: isToday ? "rgba(56, 189, 248, 0.14)" : "inherit",
                        borderLeft: isToday ? "3px solid #38bdf8" : "none"
                      }}
                    >
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{dayName.slice(0, 3)}</strong>
                        {isToday && <div><span className="pill green" style={{ fontSize: "9px", padding: "2px 6px" }}>Today</span></div>}
                      </td>

                      {/* Period 1 */}
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{slots[0]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{slots[0]?.room}</div>
                      </td>

                      {/* Period 2 */}
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{slots[1]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{slots[1]?.room}</div>
                      </td>

                      {/* Period 3 */}
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{slots[2]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{slots[2]?.room}</div>
                      </td>

                      {/* Lunch */}
                      <td style={{ background: "rgba(56, 189, 248, 0.06)", fontWeight: 700, color: "var(--navy)", borderLeft: "1px dashed var(--border)", borderRight: "1px dashed var(--border)", letterSpacing: "1px" }}>
                        L<br />U<br />N<br />C<br />H
                      </td>

                      {/* Period 4 */}
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{slots[3]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{slots[3]?.room}</div>
                      </td>

                      {/* Period 5 */}
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{slots[4]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{slots[4]?.room}</div>
                      </td>

                      {/* Period 6 */}
                      <td>
                        <strong style={{ color: "var(--text-heading)" }}>{slots[5]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{slots[5]?.room}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* OFFICIAL FACULTY & COURSE CODE DIRECTORY TABLE (From bottom of photo) */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Course Faculty & Syllabus Directory</h2>
            <p>Faculty member allocations as approved by Head of Department (CSE) & Class Incharge.</p>
          </div>
          <span className="pill green">Class Incharge: Mrs T Sai Priyanka</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Faculty Name</th>
                <th>Default Venue</th>
              </tr>
            </thead>
            <tbody>
              {data?.subjects?.map((sub) => (
                <tr key={sub.code}>
                  <td><strong>{sub.code}</strong></td>
                  <td className="subject-name">
                    <strong>{sub.name}</strong> ({sub.key})
                  </td>
                  <td><strong>{sub.faculty}</strong></td>
                  <td>
                    <span className="pill blue">
                      {sub.key.includes("LAB")
                        ? sub.key === "JAVA_LAB" || sub.key === "DBMS_LAB"
                          ? "Lab JC001"
                          : "MG405, MG406"
                        : "Room MG 107"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
