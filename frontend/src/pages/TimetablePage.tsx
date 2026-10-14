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
            background: "linear-gradient(135deg, #eef9f2, #e0f6e9)",
            borderLeft: "4px solid #28a745",
            marginBottom: "20px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className="pill green" style={{ animation: "pulse 2s infinite" }}>
                ● ONGOING CLASS NOW
              </span>
              <h3 style={{ margin: "6px 0 2px", color: "#192b45" }}>
                Period {ongoingSlot.period}: {ongoingSlot.name} ({ongoingSlot.subject})
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                Time: <strong>{ongoingSlot.time_slot}</strong> &nbsp;•&nbsp; Faculty: <strong>{ongoingSlot.faculty}</strong> &nbsp;•&nbsp; Room/Lab: <strong>{ongoingSlot.room}</strong>
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
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
            {daysList.map((day) => {
              const isToday = day === data?.currentDay;
              const isSelected = day === activeDay;
              return (
                <button
                  key={day}
                  className={`pill ${isSelected ? "blue" : "secondary"}`}
                  style={{
                    cursor: "pointer",
                    padding: "8px 16px",
                    fontWeight: 700,
                    border: isSelected ? "none" : "1px solid var(--border)",
                    background: isSelected ? "var(--navy)" : "#ffffff",
                    color: isSelected ? "#ffffff" : "inherit"
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
                        <tr style={{ background: "#f8faff", fontStyle: "italic" }}>
                          <td>🍽️</td>
                          <td><strong>12:20 - 01:10</strong></td>
                          <td colSpan={4}><strong>LUNCH BREAK</strong></td>
                          <td><span className="pill">Break</span></td>
                        </tr>
                      )}
                      <tr
                        style={{
                          background: slot.status === "Ongoing" && activeDay === data?.currentDay ? "#f2fff5" : "inherit"
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
                  <th style={{ background: "#eef2f8", color: "var(--navy)", fontWeight: 800 }}>
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
                    <tr key={dayName} style={{ background: isToday ? "#f6fbff" : "inherit" }}>
                      <td>
                        <strong>{dayName.slice(0, 3)}</strong>
                        {isToday && <div><span className="pill green" style={{ fontSize: "9px", padding: "2px 6px" }}>Today</span></div>}
                      </td>

                      {/* Period 1 */}
                      <td>
                        <strong>{slots[0]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>{slots[0]?.room}</div>
                      </td>

                      {/* Period 2 */}
                      <td>
                        <strong>{slots[1]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>{slots[1]?.room}</div>
                      </td>

                      {/* Period 3 */}
                      <td>
                        <strong>{slots[2]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>{slots[2]?.room}</div>
                      </td>

                      {/* Lunch */}
                      <td style={{ background: "#f8faff", fontWeight: 700, color: "var(--muted)" }}>
                        L<br />U<br />N<br />C<br />H
                      </td>

                      {/* Period 4 */}
                      <td>
                        <strong>{slots[3]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>{slots[3]?.room}</div>
                      </td>

                      {/* Period 5 */}
                      <td>
                        <strong>{slots[4]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>{slots[4]?.room}</div>
                      </td>

                      {/* Period 6 */}
                      <td>
                        <strong>{slots[5]?.subject || "—"}</strong>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>{slots[5]?.room}</div>
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
