import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db, initDatabase } from "./database.js";
import { classInfo, subjectsList } from "./students_data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"]
  })
);
app.use(express.json());

// Force rebuild if database has old data, else initialize
initDatabase();

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "sqlite",
    classInfo
  });
});

// -------------------------------------------------------------
// Authentication Endpoints
// Login with only roll number, and password is also roll number!
// -------------------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  const { roll_number, password } = req.body;

  if (!roll_number) {
    return res.status(400).json({ error: "Please enter your roll number." });
  }

  const cleanRoll = roll_number.trim().toUpperCase();
  const student = db.prepare(`
    SELECT * FROM students 
    WHERE UPPER(roll_number) = ?
  `).get(cleanRoll);

  if (!student) {
    return res.status(401).json({
      error: `Roll number "${cleanRoll}" not found in CSE-G records. Try a valid roll number like 25R21A05JP or 25R21A05KG.`
    });
  }

  // Allow login if:
  // 1. Password equals roll number (case-insensitive)
  // 2. Or password was left empty (login with only roll number)
  // 3. Or password matches stored password
  const enteredPass = (password || "").trim().toUpperCase();
  if (!password || enteredPass === cleanRoll || enteredPass === student.password.toUpperCase()) {
    return res.json({
      success: true,
      token: `session_${student.id}_${Date.now()}`,
      student: formatStudent(student)
    });
  }

  // If wrong password was explicitly entered
  return res.status(401).json({
    error: "Invalid password. Your password is your Roll Number (e.g., " + cleanRoll + ")."
  });
});

app.get("/api/auth/me", (req, res) => {
  const rollNumber = req.query.roll || req.headers["x-roll-number"];
  if (!rollNumber) {
    return res.status(400).json({ error: "No roll number provided" });
  }

  const student = db.prepare(`
    SELECT * FROM students WHERE UPPER(roll_number) = ?
  `).get(String(rollNumber).trim().toUpperCase());

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(formatStudent(student));
});

// Helper for real-time period status
function calculatePeriodStatus(startTime, endTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = startTime.split(":").map(Number);
  const startMinutes = sH * 60 + sM;

  const [eH, eM] = endTime.split(":").map(Number);
  const endMinutes = eH * 60 + eM;

  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return "Ongoing";
  } else if (currentMinutes > endMinutes) {
    return "Completed";
  } else {
    return "Upcoming";
  }
}

function getDaySchedule(dayName) {
  const slots = db.prepare(`
    SELECT * FROM weekly_timetable 
    WHERE LOWER(day) = LOWER(?) 
    ORDER BY period ASC
  `).all(dayName);

  return slots.map(slot => ({
    ...slot,
    time_slot: slot.time_slot,
    status: calculatePeriodStatus(slot.start_time, slot.end_time)
  }));
}

// -------------------------------------------------------------
// Timetable Endpoint (Real-time active slot + Full Weekly Matrix)
// -------------------------------------------------------------
app.get("/api/timetable", (req, res) => {
  const dayParam = req.query.day;
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const currentDayName = currentDayIndex === 0 ? "Monday" : daysOfWeek[currentDayIndex];
  const targetDay = dayParam || currentDayName;

  const dailySchedule = getDaySchedule(targetDay);
  const allWeekly = db.prepare("SELECT * FROM weekly_timetable ORDER BY id ASC").all();

  const weeklyMatrix = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  };

  allWeekly.forEach(slot => {
    if (weeklyMatrix[slot.day]) {
      weeklyMatrix[slot.day].push({
        ...slot,
        status: slot.day === currentDayName ? calculatePeriodStatus(slot.start_time, slot.end_time) : "Scheduled"
      });
    }
  });

  res.json({
    classInfo,
    currentDay: currentDayName,
    selectedDay: targetDay,
    currentTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    dailySchedule,
    weeklyMatrix,
    subjects: subjectsList,
    periods: [
      { period: 1, timeSlot: "09:10 - 10:20" },
      { period: 2, timeSlot: "10:20 - 11:20" },
      { period: 3, timeSlot: "11:20 - 12:20" },
      { period: "LUNCH", timeSlot: "12:20 - 01:10" },
      { period: 4, timeSlot: "01:10 - 02:10" },
      { period: 5, timeSlot: "02:10 - 03:10" },
      { period: 6, timeSlot: "03:10 - 04:10" }
    ]
  });
});

// -------------------------------------------------------------
// Dashboard Endpoint
// -------------------------------------------------------------
app.get("/api/dashboard/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const currentDayName = currentDayIndex === 0 ? "Monday" : daysOfWeek[currentDayIndex];

  const announcements = db.prepare("SELECT * FROM announcements WHERE is_active = 1 ORDER BY date DESC").all();
  const timetable = getDaySchedule(currentDayName);
  const checklist = db.prepare("SELECT * FROM clearance_checklists WHERE student_id = ?").all(studentId);
  const subjectAttendance = db.prepare("SELECT * FROM subject_attendance WHERE student_id = ? ORDER BY id ASC").all(studentId);

  const pendingCount = checklist.filter(item => item.status !== "clear").length;

  res.json({
    student: formatStudent(student),
    stats: {
      attendance: student.attendance_percentage,
      totalConducted: student.total_conducted,
      totalAttended: student.total_attended,
      cgpa: student.cgpa.toFixed(2),
      deptRank: student.dept_rank,
      collegeRank: student.college_rank,
      pendingClearances: pendingCount
    },
    classInfo,
    currentDay: currentDayName,
    subjectAttendance,
    announcements,
    timetable,
    checklists: checklist
  });
});

// -------------------------------------------------------------
// Attendance Endpoints
// Full subject attendance from uploaded PDF + interactive calendar
// -------------------------------------------------------------
app.get("/api/attendance/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);
  const month = req.query.month !== undefined ? Number(req.query.month) : 8; // default to September (0-indexed 8)
  const year = req.query.year !== undefined ? Number(req.query.year) : 2026;

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Get official subject-wise attendance from uploaded document
  const subjects = db.prepare(`
    SELECT * FROM subject_attendance 
    WHERE student_id = ? 
    ORDER BY id ASC
  `).all(studentId);

  // Calendar dates calculation
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(totalDays).padStart(2, "0")}`;

  const savedRecords = db.prepare(`
    SELECT * FROM attendance_records
    WHERE student_id = ? AND date BETWEEN ? AND ?
  `).all(studentId, startStr, endStr);

  const savedMap = new Map();
  savedRecords.forEach(r => savedMap.set(r.date, r.status));

  const records = [];
  let presentCount = 0;
  let absentCount = 0;
  let weekendCount = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month, day);
    const weekday = dateObj.getDay();
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    let status;
    if (savedMap.has(dateKey)) {
      status = savedMap.get(dateKey);
    } else {
      if (weekday === 0 || weekday === 6) {
        status = "weekend";
      } else {
        // Deterministic status reflecting the student's exact attendance percentage
        const ratio = student.attendance_percentage / 100;
        const seed = (day * 17 + student.s_no * 23) % 100;
        status = seed <= ratio * 100 ? "present" : "absent";
      }
    }

    if (status === "present") presentCount++;
    else if (status === "absent") absentCount++;
    else if (status === "weekend") weekendCount++;

    records.push({
      day,
      weekday,
      date: dateKey,
      status
    });
  }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const currentDayName = currentDayIndex === 0 ? "Monday" : daysOfWeek[currentDayIndex];
  const timetable = getDaySchedule(currentDayName);

  res.json({
    month,
    year,
    classInfo,
    officialRecord: {
      conducted: student.total_conducted,
      attended: student.total_attended,
      percentage: student.attendance_percentage,
      dateRange: classInfo.dateRange,
      incharge: classInfo.classIncharge
    },
    subjectAttendance: subjects,
    records,
    stats: {
      overallAttendance: student.attendance_percentage,
      totalConducted: student.total_conducted,
      totalAttended: student.total_attended,
      monthAttendance: ((presentCount / (presentCount + absentCount || 1)) * 100).toFixed(1),
      presentDays: presentCount,
      absentDays: absentCount,
      weekendDays: weekendCount,
      totalDays
    },
    timetable
  });
});

// Live Toggle Attendance for a Day
app.post("/api/attendance/:studentId/toggle", (req, res) => {
  const studentId = Number(req.params.studentId);
  const { date, status } = req.body;

  if (!date || !status) {
    return res.status(400).json({ error: "Date and status are required" });
  }

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const existing = db.prepare("SELECT * FROM attendance_records WHERE student_id = ? AND date = ?").get(studentId, date);
  if (existing) {
    db.prepare("UPDATE attendance_records SET status = ? WHERE id = ?").run(status, existing.id);
  } else {
    db.prepare(`
      INSERT INTO attendance_records (student_id, date, status)
      VALUES (?, ?, ?)
    `).run(studentId, date, status);
  }

  res.json({ success: true, date, status });
});

// -------------------------------------------------------------
// Marks & Results Endpoint
// -------------------------------------------------------------
app.get("/api/marks/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const marks = db.prepare(`
    SELECT * FROM marks 
    WHERE student_id = ? 
    ORDER BY id ASC
  `).all(studentId);

  const totalCredits = marks.reduce((acc, m) => acc + m.credits, 0);
  const totalScore = marks.reduce((acc, m) => acc + m.total_marks, 0);
  const averagePercentage = marks.length > 0 ? (totalScore / marks.length).toFixed(1) : 0;

  res.json({
    student: formatStudent(student),
    classInfo,
    semester: student.year_sem,
    subjects: marks,
    summary: {
      cgpa: student.cgpa.toFixed(2),
      totalCredits,
      averagePercentage,
      totalSubjects: marks.length,
      resultStatus: student.attendance_percentage >= 75 ? "PASSED WITH DISTINCTION" : "CONDONATION APPLIED"
    }
  });
});

// -------------------------------------------------------------
// Student Status & Clearance Checklist
// -------------------------------------------------------------
app.get("/api/status/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const checklists = db.prepare("SELECT * FROM clearance_checklists WHERE student_id = ? ORDER BY id ASC").all(studentId);

  res.json({
    student: formatStudent(student),
    classInfo,
    checklists,
    academicStanding: {
      attendanceStatus: student.attendance_percentage >= 75
        ? "Eligible for Examinations (≥ 75%)"
        : `Condonation Required (${student.attendance_percentage}% is below 75% threshold)`,
      deptRank: student.dept_rank,
      collegeRank: student.college_rank,
      classIncharge: student.class_incharge,
      conduct: "Exemplary",
      admissionStatus: "Regular Active"
    }
  });
});

// Toggle Checklist item
app.post("/api/status/:studentId/toggle-item", (req, res) => {
  const studentId = Number(req.params.studentId);
  const { itemId } = req.body;

  const item = db.prepare("SELECT * FROM clearance_checklists WHERE id = ? AND student_id = ?").get(itemId, studentId);
  if (!item) {
    return res.status(404).json({ error: "Checklist item not found" });
  }

  const nextStatus = item.status === "clear" ? "pending" : "clear";
  db.prepare("UPDATE clearance_checklists SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(nextStatus, itemId);

  const updatedItem = db.prepare("SELECT * FROM clearance_checklists WHERE id = ?").get(itemId);
  res.json({ success: true, item: updatedItem });
});

// -------------------------------------------------------------
// Class Directory Endpoints
// Lists all 69 students from Section G
// -------------------------------------------------------------
app.get("/api/students", (req, res) => {
  const search = (req.query.search || "").trim().toLowerCase();
  const attendance = req.query.attendance || "All";

  let query = "SELECT * FROM students WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND (LOWER(full_name) LIKE ? OR LOWER(roll_number) LIKE ? OR LOWER(hall_ticket) LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (attendance === "Good") {
    query += " AND attendance_percentage >= 75";
  } else if (attendance === "Low") {
    query += " AND attendance_percentage < 75";
  }

  query += " ORDER BY s_no ASC";

  const students = db.prepare(query).all(...params).map(formatStudent);

  // Metrics
  const totalStudents = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;
  const goodAttendance = db.prepare("SELECT COUNT(*) AS c FROM students WHERE attendance_percentage >= 75").get().c;
  const lowAttendance = totalStudents - goodAttendance;

  res.json({
    students,
    classInfo,
    metrics: {
      total: totalStudents,
      cseA: totalStudents, // CSE-G section total
      cseB: 0,
      goodAttendance,
      lowAttendance
    }
  });
});

app.get("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const marks = db.prepare("SELECT * FROM marks WHERE student_id = ?").all(id);
  const checklists = db.prepare("SELECT * FROM clearance_checklists WHERE student_id = ?").all(id);
  const subjectAttendance = db.prepare("SELECT * FROM subject_attendance WHERE student_id = ?").all(id);

  res.json({
    student: formatStudent(student),
    classInfo,
    marks,
    checklists,
    subjectAttendance
  });
});

// -------------------------------------------------------------
// Document Download Generator
// Uses official MLR Institute of Technology CSE-G details
// -------------------------------------------------------------
app.get("/api/documents/:studentId/:docType", (req, res) => {
  const studentId = Number(req.params.studentId);
  const { docType } = req.params;

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student) {
    return res.status(404).send("Student not found");
  }

  const marks = db.prepare("SELECT * FROM marks WHERE student_id = ?").all(studentId);
  const subjectAtt = db.prepare("SELECT * FROM subject_attendance WHERE student_id = ?").all(studentId);

  let docContent = "";
  let fileName = `${docType}-${student.roll_number}.txt`;

  const border = "=".repeat(82);
  const divider = "-".repeat(82);

  const header = `
${border}
                 MLR INSTITUTE OF TECHNOLOGY (UGC AUTONOMOUS)
   Accredited by NAAC with 'A' Grade | Approved by AICTE | Affiliated to JNTUH
               Laxman Reddy Avenue, Dundigal, Hyderabad - 500 043
            Department of Computer Science and Engineering (CSE-G)
${border}
Class/Section:  ${classInfo.branch} - ${classInfo.yearSem} (${classInfo.section})
Class Incharge: ${classInfo.classIncharge}
Attendance Ref: ${classInfo.dateRange}
${divider}
`;

  switch (docType) {
    case "attendance-statement":
    case "fee-receipt":
      docContent = `${header}
                    OFFICIAL SEMESTER ATTENDANCE STATEMENT
Student Name:     ${student.full_name}
Roll Number:      ${student.roll_number}
Hall Ticket:      ${student.hall_ticket}
Overall Summary:  Conducted: ${student.total_conducted} | Attended: ${student.total_attended} | Total %: ${student.attendance_percentage}%
Condonation Rule: ${student.attendance_percentage >= 75 ? "ELIGIBLE FOR EXAMINATIONS (CLEAR)" : "WARNING: BELOW 75% MANDATORY THRESHOLD"}
${divider}
SUBJECT-WISE ATTENDANCE BREAKDOWN:
Code      Subject Key  Subject Name                     Conducted Attended Percentage
----------------------------------------------------------------------------------
${subjectAtt.map(s => `${s.subject_code.padEnd(9)} ${s.subject_key.padEnd(12)} ${s.subject_name.slice(0, 30).padEnd(32)} ${String(s.conducted).padEnd(9)} ${String(s.attended).padEnd(8)} ${s.percentage.toFixed(2)}%`).join("\n")}
${divider}
Class Incharge: Mrs. T. Sai Priyanka                Head of Department (CSE)
MLR Institute of Technology                         MLRIT, Hyderabad
${border}
`;
      break;

    case "semester-hall-ticket":
    case "internal-hall-ticket":
      const isInternal = docType.includes("internal");
      docContent = `${header}
      OFFICIAL HALL TICKET — ${isInternal ? "CONTINUOUS INTERNAL EVALUATION (CIE)" : "SEMESTER END EXAMINATIONS (SEE)"}
Exam Series: Nov/Dec 2026                         Issue Date: ${new Date().toLocaleDateString("en-IN")}
${divider}
CANDIDATE CREDENTIALS:
Name:             ${student.full_name}
Roll Number:      ${student.roll_number}
Hall Ticket No:   ${student.hall_ticket}
Programme:        B.Tech - Computer Science and Engineering (${student.section})
Academic Period:  ${student.year_sem} (${student.academic_year})
Exam Center:      MLR Institute of Technology, Dundigal, Hyderabad
${divider}
REGISTERED SUBJECTS & SCHEDULE:
Code      Subject Name                                 Type      Time Slot
----------------------------------------------------------------------------------
CS2101    Discrete Mathematics (DM)                    Theory    10:00 AM - 01:00 PM
CS2102    Software Engineering (SE)                    Theory    10:00 AM - 01:00 PM
CS2104    Java Programming (JAVA)                      Theory    10:00 AM - 01:00 PM
CS2107    Computer Organization & Architecture (COA)   Theory    10:00 AM - 01:00 PM
CS2108    Internet of Everything (IOE)                 Theory    10:00 AM - 01:00 PM
CS2110    Database Management Systems (DBMS)           Theory    10:00 AM - 01:00 PM
CS2103L   Software Engineering Lab                     Practical 02:00 PM - 05:00 PM
CS2105L   Java Programming Lab                         Practical 02:00 PM - 05:00 PM
CS2106L   Skill Development Lab                        Practical 02:00 PM - 05:00 PM
CS2111L   DBMS Lab                                     Practical 02:00 PM - 05:00 PM
${divider}
NOTE: Bring identity card and occupy allotted seat 15 minutes before exam commencement.
${border}
`;
      break;

    case "semester-memo":
      docContent = `${header}
               PROVISIONAL GRADE REPORT / MARKS STATEMENT
Statement No: MLRIT-SEE-2026-${String(student.s_no).padStart(4, "0")}         Issue Date: ${new Date().toLocaleDateString("en-IN")}
${divider}
Student Name:    ${student.full_name}
Roll Number:     ${student.roll_number}
Hall Ticket No:  ${student.hall_ticket}
Programme:       B.Tech - Computer Science and Engineering (CSE-G)
Semester:        ${student.year_sem}
${divider}
COURSE EVALUATION RECORD:
Code     Subject Name                     Int/30  Ext/70  Total/100  Credits  Grade
----------------------------------------------------------------------------------
${marks.map(m => `${m.subject_code.padEnd(8)} ${m.subject_name.slice(0, 30).padEnd(32)} ${String(m.internal_marks).padEnd(7)} ${String(m.external_marks).padEnd(7)} ${String(m.total_marks).padEnd(10)} ${String(m.credits).padEnd(8)} ${m.grade}`).join("\n")}
${divider}
CUMULATIVE PERFORMANCE:
CGPA: ${student.cgpa.toFixed(2)} / 10.00 | Department Rank: #${student.dept_rank}
Attendance Percentage: ${student.attendance_percentage}% (${student.total_attended} / ${student.total_conducted} classes attended)
${divider}
Controller of Examinations                                      Principal
MLR Institute of Technology                                     MLRIT, Hyderabad
${border}
`;
      break;

    default:
      docContent = `${header}\nOfficial Record: ${docType}\nStudent: ${student.full_name} (${student.roll_number})\n`;
  }

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(docContent);
});

// Helper to format student fields to match frontend expectation
function formatStudent(row) {
  return {
    id: row.id,
    sNo: row.s_no,
    roll: row.roll_number,
    rollNumber: row.roll_number,
    firstName: row.first_name,
    lastName: row.last_name,
    first: row.first_name,
    surname: row.last_name,
    fullName: row.full_name,
    hallTicket: row.hall_ticket,
    section: row.section,
    branch: row.branch,
    yearSem: row.year_sem,
    classIncharge: row.class_incharge,
    academicYear: row.academic_year,
    studentId: row.student_id,
    totalConducted: row.total_conducted,
    totalAttended: row.total_attended,
    attendance: row.attendance_percentage,
    cgpa: row.cgpa.toFixed(2),
    deptRank: row.dept_rank,
    collegeRank: row.college_rank,
    avatar: row.avatar
  };
}

// Serve production frontend assets when built
const distPath = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(distPath)) {
  console.log(`[Server] Serving production frontend build from ${distPath}`);
  app.use(express.static(distPath));

  // Catch-all route for SPA client-side routing
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[Server] MLR Student Portal SQLite backend running on http://localhost:${PORT}`);
});
