import React, { useEffect, useState } from "react";
import { Student, MarkItem, ChecklistItem, SubjectAttendance, ClassInfo } from "../types";
import { StatCard } from "../components/StatCard";
import { getStudentDetails } from "../services/api";

interface StudentProfilePageProps {
  student: Student;
  onBack: () => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  student: initialStudent,
  onBack
}) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);

  useEffect(() => {
    let isMounted = true;
    getStudentDetails(initialStudent.id)
      .then((data) => {
        if (!isMounted) return;
        setStudent(data.student);
        setClassInfo(data.classInfo);
        setMarks(data.marks);
        setChecklists(data.checklists);
        setSubjects(data.subjectAttendance || []);
      })
      .catch((err) => console.error("Error fetching student profile:", err));

    return () => {
      isMounted = false;
    };
  }, [initialStudent.id]);

  const isEligible = student.attendance >= 75.0;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {classInfo?.branch || "CSE"} · {classInfo?.yearSem || "II/I Sem"} ({classInfo?.section || "SECTION - G"})
          </span>
          <h1>Student Academic Dossier</h1>
          <p>Verified profile record from MLR Institute of Technology database.</p>
        </div>

        <button className="button button-secondary" onClick={onBack}>
          ← Back to Class Directory
        </button>
      </div>

      <section className="panel">
        <div className="profile-layout">
          <div className="profile-avatar">
            {student.first[0]}
            {student.surname[0]}
          </div>

          <div>
            <h2>{student.fullName}</h2>
            <p className="muted">
              {student.branch} &nbsp;•&nbsp; Section {student.section} &nbsp;•&nbsp; Roll #{student.sNo}
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <span className="pill blue">Roll: {student.roll}</span>
              <span className={`pill ${isEligible ? "green" : "red"}`}>
                {isEligible ? "Eligible (≥ 75%)" : "Condonation Required"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          icon="◉"
          label="Overall Attendance"
          value={`${student.attendance}%`}
          detail={`${student.totalAttended} of ${student.totalConducted} classes`}
          color={isEligible ? "green" : "orange"}
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
          detail="Out of 69 CSE-G students"
          color="blue"
        />
      </div>

      <section className="panel">
        <h2>Institutional Credentials</h2>
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
            <span>Department & Branch</span>
            <strong>{student.branch}</strong>
          </div>
          <div>
            <span>Section & Semester</span>
            <strong>{student.section} &nbsp;({student.yearSem || "II/I Sem"})</strong>
          </div>
          <div>
            <span>Class Incharge</span>
            <strong>{student.classIncharge || "Mrs. T. Sai Priyanka"}</strong>
          </div>
          <div>
            <span>Attendance Period</span>
            <strong>16-09-2026 To 30-09-2026</strong>
          </div>
        </div>
      </section>

      {/* Subject Attendance Breakdown */}
      {subjects.length > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Course Attendance Breakdown</h2>
              <p>Official ledger records for current semester.</p>
            </div>
            <span className="pill blue">{subjects.length} Courses</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Key</th>
                  <th>Course Title</th>
                  <th style={{ textAlign: "center" }}>Conducted</th>
                  <th style={{ textAlign: "center" }}>Attended</th>
                  <th style={{ textAlign: "center" }}>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => {
                  const sOk = s.percentage >= 75.0 || s.conducted === 0;
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.subject_code}</strong></td>
                      <td><span className="pill blue">{s.subject_key}</span></td>
                      <td className="subject-name">{s.subject_name}</td>
                      <td style={{ textAlign: "center" }}>{s.conducted}</td>
                      <td style={{ textAlign: "center" }}>{s.attended}</td>
                      <td style={{ textAlign: "center" }}>
                        <strong>{s.conducted > 0 ? `${s.percentage.toFixed(2)}%` : "N/A"}</strong>
                      </td>
                      <td>
                        <span className={`pill ${sOk ? "green" : "red"}`}>
                          {s.conducted === 0 ? "Exempt" : sOk ? "Eligible" : "Warning"}
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

      {/* Marks Statement */}
      {marks.length > 0 && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Examination Marks Statement</h2>
              <p>Continuous internal evaluation & practical laboratory scores.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Int/30</th>
                  <th>Ext/70</th>
                  <th>Total/100</th>
                  <th>Credits</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.subject_code}</strong></td>
                    <td className="subject-name">{m.subject_name}</td>
                    <td>{m.internal_marks}</td>
                    <td>{m.external_marks}</td>
                    <td><strong>{m.total_marks}</strong></td>
                    <td>{m.credits}</td>
                    <td><span className="pill green">{m.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {checklists.length > 0 && (
        <section className="panel">
          <h2>Clearance Checklist</h2>
          {checklists.map((c) => (
            <div className="task-row" key={c.id}>
              <div>
                <strong>{c.item_name}</strong>
                <p>{c.description}</p>
              </div>
              <span className={`pill ${c.status === "clear" ? "green" : "orange"}`}>
                {c.status === "clear" ? "Cleared" : "Pending"}
              </span>
            </div>
          ))}
        </section>
      )}
    </>
  );
};
