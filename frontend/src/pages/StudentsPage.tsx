import React, { useEffect, useState, useCallback } from "react";
import { Student, DirectoryMetrics, ClassInfo } from "../types";
import { StatCard } from "../components/StatCard";
import { getStudentsDirectory } from "../services/api";

interface StudentsPageProps {
  onViewStudent: (student: Student) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onViewStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [metrics, setMetrics] = useState<DirectoryMetrics>({
    total: 69,
    cseA: 69,
    cseB: 0,
    goodAttendance: 0,
    lowAttendance: 0
  });
  const [search, setSearch] = useState<string>("");
  const [attendance, setAttendance] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDirectory = useCallback(() => {
    setLoading(true);
    getStudentsDirectory(search, "All", attendance)
      .then((data) => {
        setStudents(data.students);
        setClassInfo(data.classInfo);
        setMetrics(data.metrics);
      })
      .catch((err) => console.error("Error fetching students:", err))
      .finally(() => setLoading(false));
  }, [search, attendance]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDirectory();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchDirectory]);

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {classInfo?.branch || "CSE"} · {classInfo?.yearSem || "II/I Sem"} ({classInfo?.section || "SECTION - G"})
          </span>
          <h1>CSE-G Class Directory</h1>
          <p>
            Official cohort roster of 69 students (Class Incharge: <strong>{classInfo?.classIncharge || "Mrs. T. Sai Priyanka"}</strong>).
          </p>
        </div>
        <span className="pill blue">{students.length} Students Listed</span>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="♙"
          label="Total Students"
          value={metrics.total}
          detail="Official CSE-G enrollment"
          color="blue"
        />
        <StatCard
          icon="✓"
          label="Eligible (≥ 75%)"
          value={metrics.goodAttendance}
          detail="Satisfies condonation threshold"
          color="green"
        />
        <StatCard
          icon="×"
          label="Low Attendance (< 75%)"
          value={metrics.lowAttendance || metrics.total - metrics.goodAttendance}
          detail="Condonation required"
          color="orange"
        />
        <StatCard
          icon="★"
          label="Top Attendance"
          value="92.38%"
          detail="VITTAL ROHITH (25R21A05LH)"
          color="purple"
        />
      </div>

      <section className="panel">
        <div className="directory-toolbar">
          <div className="directory-search">
            <span>⌕</span>
            <input
              aria-label="Search students"
              placeholder="Search by student name or roll number (e.g. 25R21A05JP, ROHITH)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter attendance"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
          >
            <option value="All">All Attendance ({metrics.total})</option>
            <option value="Good">Eligible: 75% and above ({metrics.goodAttendance})</option>
            <option value="Low">Warning: Below 75% ({metrics.lowAttendance || metrics.total - metrics.goodAttendance})</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>STUDENT NAME</th>
                <th>ROLL NUMBER</th>
                <th>SECTION</th>
                <th>ATTENDED / TOTAL</th>
                <th>ATTENDANCE %</th>
                <th>PROFILE</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id}>
                  <td><strong>#{st.sNo}</strong></td>
                  <td>
                    <div className="directory-student">
                      <div className="directory-avatar">
                        {st.first[0]}
                        {st.surname[0]}
                      </div>
                      <div>
                        <strong>{st.fullName}</strong>
                        <span>Rank #{st.deptRank} in Section</span>
                      </div>
                    </div>
                  </td>
                  <td><strong>{st.roll}</strong></td>
                  <td><span className="pill blue">{st.section}</span></td>
                  <td>{st.totalAttended} / {st.totalConducted}</td>
                  <td>
                    <span className={`pill ${st.attendance >= 75 ? "green" : "red"}`}>
                      {st.attendance}%
                    </span>
                  </td>
                  <td>
                    <button
                      className="button button-secondary"
                      onClick={() => onViewStudent(st)}
                    >
                      View Dossier →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && !loading && (
          <div className="empty-state">
            <span>⌕</span>
            <h3>No students found</h3>
            <p>Try searching with a different name or roll number.</p>
            <button
              className="button button-secondary"
              onClick={() => {
                setSearch("");
                setAttendance("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </>
  );
};
