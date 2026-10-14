import React, { useState } from "react";
import { Student } from "../types";
import { getDocumentDownloadUrl } from "../services/api";

interface DownloadsPageProps {
  student: Student;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({ student }) => {
  const [downloadNotice, setDownloadNotice] = useState<string>("");

  const documents = [
    {
      id: "attendance-statement",
      icon: "▦",
      title: "Official Subject-wise Attendance Statement",
      desc: "Certified attendance sheet showing classes conducted, attended, and percentage across all 12 subjects."
    },
    {
      id: "semester-memo",
      icon: "▤",
      title: "Provisional Semester Marks Statement",
      desc: "Course grade statement for II/I Sem with credits, grades, and CGPA calculations."
    },
    {
      id: "semester-hall-ticket",
      icon: "▣",
      title: "Semester Examination Hall Ticket",
      desc: "Official hall ticket for Autonomous Semester End Examinations (SEE)."
    },
    {
      id: "internal-hall-ticket",
      icon: "▣",
      title: "Mid-Term Examination Hall Ticket",
      desc: "Official hall ticket for Continuous Internal Evaluation (CIE)."
    },
    {
      id: "fee-receipt",
      icon: "▤",
      title: "Academic & Tuition Fee Receipt",
      desc: "System-generated electronic fee receipt with transaction reference."
    }
  ];

  const handleDownload = (docId: string, title: string) => {
    const url = getDocumentDownloadUrl(student.id, docId);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${docId}-${student.roll}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice(`✓ Successfully generated and downloaded ${title} for ${student.fullName} (${student.roll}).`);
    setTimeout(() => setDownloadNotice(""), 4500);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DOCUMENT SERVICES</span>
          <h1>Downloads & Certificates</h1>
          <p>
            Official certificates and attendance records for CSE-G (Class Incharge: <strong>{student.classIncharge || "Mrs. T. Sai Priyanka"}</strong>).
          </p>
        </div>
      </div>

      {downloadNotice && (
        <div className="notice" role="status" style={{ marginBottom: "20px" }}>
          {downloadNotice}
        </div>
      )}

      <div className="download-grid">
        {documents.map((doc) => (
          <div className="download-card" key={doc.id}>
            <div className="download-icon">{doc.icon}</div>
            <h3>{doc.title}</h3>
            <p>{doc.desc}</p>
            <button
              className="button button-secondary"
              onClick={() => handleDownload(doc.id, doc.title)}
            >
              ⇩ Download Document
            </button>
          </div>
        ))}
      </div>

      <p className="demo-note">
        All generated records are authenticated from the MLRIT institutional database and include complete course details, attendance ratios, and examination schedules.
      </p>
    </>
  );
};
