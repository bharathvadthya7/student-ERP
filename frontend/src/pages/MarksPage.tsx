import React, { useEffect, useState } from "react";
import { Student, MarkItem, ClassInfo } from "../types";
import { StatCard } from "../components/StatCard";
import { getMarksData } from "../services/api";

interface MarksPageProps {
  student: Student;
}

export const MarksPage: React.FC<MarksPageProps> = ({ student }) => {
  const [subjects, setSubjects] = useState<MarkItem[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [summary, setSummary] = useState<{
    cgpa: string;
    totalCredits: number;
    averagePercentage: string;
    totalSubjects: number;
    resultStatus: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMarksData(student.id)
      .then((data) => {
        if (!isMounted) return;
        setSubjects(data.subjects);
        setClassInfo(data.classInfo);
        setSummary(data.summary);
      })
      .catch((err) => console.error("Marks fetch error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [student.id]);

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {classInfo?.branch || "CSE"} · {classInfo?.yearSem || "II/I Sem"} ({classInfo?.section || "SECTION - G"})
          </span>
          <h1>Marks & Results Statement</h1>
          <p>
            Autonomous curriculum course grades (Class Incharge: <strong>{classInfo?.classIncharge || "Mrs. T. Sai Priyanka"}</strong>).
          </p>
        </div>
        <span className="pill green">Autonomous Scheme</span>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="★"
          label="Cumulative CGPA"
          value={summary?.cgpa ?? student.cgpa}
          detail="Graded on 10.0 scale"
          color="blue"
        />
        <StatCard
          icon="▤"
          label="Total Credits"
          value={summary?.totalCredits ?? 27}
          detail={`Across ${subjects.length} course components`}
          color="green"
        />
        <StatCard
          icon="✓"
          label="Result Classification"
          value={student.attendance >= 75 ? "Distinction" : "Condoned"}
          detail="Passed all registered courses"
          color="purple"
        />
        <StatCard
          icon="№"
          label="Section Rank"
          value={`Rank #${student.deptRank}`}
          detail="Out of 69 CSE-G students"
          color="orange"
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>II B.Tech I Semester (CSE-G) Course Grades</h2>
            <p>Evaluation records linked to all 12 courses from the institutional syllabus.</p>
          </div>
          <span className="pill blue">{subjects.length} Courses</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Subject Name</th>
                <th>Internal / 30</th>
                <th>External / 70</th>
                <th>Total / 100</th>
                <th>Credits</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub.id}>
                  <td><strong>{sub.subject_code}</strong></td>
                  <td className="subject-name">{sub.subject_name}</td>
                  <td>{sub.internal_marks}</td>
                  <td>{sub.external_marks}</td>
                  <td><strong>{sub.total_marks}</strong></td>
                  <td>{sub.credits}</td>
                  <td>
                    <span className={`pill ${sub.grade === "O" || sub.grade === "A+" || sub.grade === "COMPLETED" ? "green" : "blue"}`}>
                      {sub.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="demo-note">
          Official marks memo issued under autonomous regulations of MLR Institute of Technology, affiliated to JNTUH.
        </p>
      </section>
    </>
  );
};
