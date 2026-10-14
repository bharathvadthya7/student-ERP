import React, { useEffect, useState, useCallback } from "react";
import { Student, ChecklistItem, ClassInfo } from "../types";
import { StatCard } from "../components/StatCard";
import { getStatusData, toggleChecklistItem } from "../services/api";

interface StatusPageProps {
  student: Student;
}

export const StatusPage: React.FC<StatusPageProps> = ({ student }) => {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [standing, setStanding] = useState<{
    attendanceStatus: string;
    deptRank: number;
    collegeRank: number;
    classIncharge: string;
    conduct: string;
    admissionStatus: string;
  } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const loadData = useCallback(() => {
    getStatusData(student.id)
      .then((data) => {
        setChecklists(data.checklists);
        setClassInfo(data.classInfo);
        setStanding(data.academicStanding);
      })
      .catch((err) => console.error("Error loading status:", err));
  }, [student.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (itemId: number) => {
    try {
      const res = await toggleChecklistItem(student.id, itemId);
      if (res.success) {
        setStatusMsg(`Clearance status updated to: ${res.item.status.toUpperCase()}`);
        setTimeout(() => setStatusMsg(""), 3000);
        loadData();
      }
    } catch (err) {
      console.error("Error toggling clearance item:", err);
    }
  };

  const pendingCount = checklists.filter((c) => c.status !== "clear").length;
  const isEligible = student.attendance >= 75.0;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {classInfo?.branch || "CSE"} · {classInfo?.yearSem || "II/I Sem"} ({classInfo?.section || "SECTION - G"})
          </span>
          <h1>Academic & Clearance Status</h1>
          <p>
            Attendance eligibility, cohort rankings, and administrative clearance checklist.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="notice" role="status" style={{ marginBottom: "16px" }}>
          ✓ {statusMsg}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon="◉"
          label="Attendance Threshold"
          value={`${student.attendance}%`}
          detail={isEligible ? "Satisfies university 75% rule" : "Below 75% condonation threshold"}
          color={isEligible ? "green" : "orange"}
        />
        <StatCard
          icon="№"
          label="Section Rank"
          value={`Rank #${student.deptRank}`}
          detail="Out of 69 CSE-G students"
          color="purple"
        />
        <StatCard
          icon="☆"
          label="College Overall Rank"
          value={`Rank #${student.collegeRank}`}
          detail="Across B.Tech departments"
          color="blue"
        />
        <StatCard
          icon="✓"
          label="Clearance Status"
          value={pendingCount === 0 ? "All Clear" : `${pendingCount} Pending`}
          detail="Click items below to toggle"
          color={pendingCount === 0 ? "green" : "orange"}
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Clearance & Approval Checklist</h2>
            <p>
              Class Incharge: <strong>{classInfo?.classIncharge || "Mrs. T. Sai Priyanka"}</strong>. Click any item to live-toggle its clearance state in the SQLite database.
            </p>
          </div>
          <span className={`pill ${pendingCount === 0 ? "green" : "orange"}`}>
            {pendingCount === 0 ? "Eligible for Examinations" : "Pending Actions"}
          </span>
        </div>

        {checklists.map((item) => (
          <div className="task-row" key={item.id}>
            <div>
              <strong>{item.item_name}</strong>
              <p>
                {item.description} &nbsp;•&nbsp; <span style={{ fontSize: "11px", color: "var(--muted)" }}>Due: {item.due_date}</span>
              </p>
            </div>
            <button
              className={`pill ${item.status === "clear" ? "green" : "orange"}`}
              style={{ cursor: "pointer", border: "none", fontSize: "12px", padding: "6px 14px" }}
              onClick={() => handleToggle(item.id)}
              title="Click to toggle status in SQLite database"
            >
              {item.status === "clear" ? "✓ Cleared" : "⚠ Pending (Click to Clear)"}
            </button>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2>Institutional Registration Details</h2>
        <div className="details-grid">
          <div>
            <span>Student Name</span>
            <strong>{student.fullName}</strong>
          </div>
          <div>
            <span>Section</span>
            <strong>{student.section} &nbsp;({student.yearSem || "II/I Sem"})</strong>
          </div>
          <div>
            <span>Roll Number / Hall Ticket</span>
            <strong>{student.roll}</strong>
          </div>
          <div>
            <span>Class Incharge</span>
            <strong>{student.classIncharge || "Mrs. T. Sai Priyanka"}</strong>
          </div>
          <div>
            <span>Disciplinary Conduct</span>
            <strong>{standing?.conduct ?? "Exemplary"}</strong>
          </div>
          <div>
            <span>Examination Standing</span>
            <strong style={{ color: isEligible ? "#218838" : "#c82333" }}>
              {standing?.attendanceStatus ?? (isEligible ? "Clear for SEE" : "Condonation Required")}
            </strong>
          </div>
        </div>
      </section>
    </>
  );
};
