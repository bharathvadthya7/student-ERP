import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { studentsList, subjectsList, classInfo, timetableWeekly } from "./students_data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "portal.db");

export let db = new DatabaseSync(dbPath);

export function initDatabase(forceRebuild = false) {
  // If forced or if old demo data is detected, drop & recreate cleanly
  if (forceRebuild && fs.existsSync(dbPath)) {
    try {
      db.close();
      fs.unlinkSync(dbPath);
      db = new DatabaseSync(dbPath);
    } catch (e) {
      console.warn("Could not delete portal.db directly, dropping tables...", e);
    }
  }

  // Enable foreign keys
  db.exec("PRAGMA foreign_keys = ON;");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      s_no INTEGER,
      roll_number TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      hall_ticket TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT 'CSE-G',
      branch TEXT NOT NULL DEFAULT 'Computer Science and Engineering',
      academic_year TEXT NOT NULL DEFAULT '2026-27',
      year_sem TEXT NOT NULL DEFAULT 'II/I Sem',
      class_incharge TEXT NOT NULL DEFAULT 'Mrs.T.Sai Priyanka',
      student_id TEXT NOT NULL,
      total_conducted INTEGER NOT NULL,
      total_attended INTEGER NOT NULL,
      attendance_percentage REAL NOT NULL,
      cgpa REAL NOT NULL DEFAULT 8.00,
      dept_rank INTEGER NOT NULL,
      college_rank INTEGER NOT NULL,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subject_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject_key TEXT NOT NULL,
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      conducted INTEGER NOT NULL,
      attended INTEGER NOT NULL,
      percentage REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'weekend', 'holiday')),
      subject TEXT,
      remarks TEXT,
      UNIQUE(student_id, date)
    );

    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      semester TEXT NOT NULL DEFAULT 'II Year I Sem',
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      internal_marks INTEGER NOT NULL,
      external_marks INTEGER NOT NULL,
      total_marks INTEGER NOT NULL,
      credits INTEGER NOT NULL,
      grade TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PASS'
    );

    CREATE TABLE IF NOT EXISTS clearance_checklists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('clear', 'pending', 'review')),
      due_date TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('exam', 'attendance', 'fees', 'general')),
      date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS daily_timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      subject TEXT NOT NULL,
      faculty TEXT NOT NULL,
      room TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled'
    );

    CREATE TABLE IF NOT EXISTS weekly_timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      period INTEGER NOT NULL,
      time_slot TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      subject TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      faculty TEXT NOT NULL,
      room TEXT NOT NULL
    );
  `);

  // Check if students have real roll numbers starting with 25R21A or 26R25A
  const sample = db.prepare("SELECT roll_number FROM students LIMIT 1").get();
  if (sample && !sample.roll_number.startsWith("DEMO")) {
    const count = db.prepare("SELECT COUNT(*) as c FROM students").get().c;
    console.log(`[Database] Real MLRIT CSE-G dataset loaded (${count} students active).`);

    // Ensure weekly_timetable is seeded
    const wCount = db.prepare("SELECT COUNT(*) as c FROM weekly_timetable").get();
    if (!wCount || wCount.c === 0) {
      console.log("[Database] Seeding official CSE-G weekly timetable from MLRIT document...");
      const insertWeekly = db.prepare(`
        INSERT INTO weekly_timetable (day, period, time_slot, start_time, end_time, subject, code, name, faculty, room)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      timetableWeekly.forEach((item) => {
        insertWeekly.run(
          item.day, item.period, item.timeSlot, item.startTime, item.endTime,
          item.subject, item.code, item.name, item.faculty, item.room
        );
      });
      console.log(`[Database] Seeded ${timetableWeekly.length} weekly timetable slots.`);
    }
    return;
  }

  console.log("[Database] Replacing old demo data with official MLRIT CSE-G Student & Attendance dataset...");

  // Clear existing old tables
  db.exec(`
    DELETE FROM marks;
    DELETE FROM subject_attendance;
    DELETE FROM attendance_records;
    DELETE FROM clearance_checklists;
    DELETE FROM announcements;
    DELETE FROM daily_timetable;
    DELETE FROM students;
  `);

  const insertStudent = db.prepare(`
    INSERT INTO students (
      s_no, roll_number, password, first_name, last_name, full_name,
      hall_ticket, section, branch, academic_year, year_sem, class_incharge,
      student_id, total_conducted, total_attended, attendance_percentage,
      cgpa, dept_rank, college_rank
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSubAttendance = db.prepare(`
    INSERT INTO subject_attendance (
      student_id, subject_key, subject_code, subject_name, conducted, attended, percentage
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMarks = db.prepare(`
    INSERT INTO marks (
      student_id, semester, subject_code, subject_name,
      internal_marks, external_marks, total_marks, credits, grade, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertChecklist = db.prepare(`
    INSERT INTO clearance_checklists (
      student_id, item_name, description, status, due_date
    ) VALUES (?, ?, ?, ?, ?)
  `);

  // Sort by attendance descending to compute departmental ranks
  const sortedStudents = [...studentsList].sort((a, b) => b.pct - a.pct);
  const rankMap = new Map();
  sortedStudents.forEach((st, idx) => {
    rankMap.set(st.roll, idx + 1);
  });

  studentsList.forEach((st) => {
    const nameParts = st.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || nameParts[0];
    // Password is the roll number itself!
    const password = st.roll.toUpperCase();
    const hallTicket = st.roll;
    const studentId = st.roll;
    const deptRank = rankMap.get(st.roll) || st.sNo;
    const collegeRank = deptRank + 5;

    // Realistic CGPA proportional to attendance performance (from 6.5 to 9.8)
    const baseCgpa = 6.0 + (st.pct / 100) * 3.6;
    const cgpa = Number(Math.min(9.95, Math.max(6.2, baseCgpa)).toFixed(2));

    insertStudent.run(
      st.sNo,
      st.roll,
      password,
      firstName,
      lastName,
      st.name,
      hallTicket,
      "CSE-G",
      "Computer Science and Engineering",
      "2026-27",
      "II/I Sem",
      "Mrs.T.Sai Priyanka",
      studentId,
      st.conducted,
      st.attended,
      st.pct,
      cgpa,
      deptRank,
      collegeRank
    );

    const sRecord = db.prepare("SELECT id FROM students WHERE roll_number = ?").get(st.roll);
    const sId = sRecord.id;

    // Insert subject-wise attendance from uploaded PDF
    subjectsList.forEach((sub) => {
      const [conducted, attended] = st.sub[sub.key] || [0, 0];
      const subPct = conducted > 0 ? Number(((attended / conducted) * 100).toFixed(2)) : 100.0;

      insertSubAttendance.run(
        sId,
        sub.key,
        sub.code,
        sub.name,
        conducted,
        attended,
        subPct
      );

      // Insert corresponding Marks for each subject
      // Scale marks according to student's subject attendance & performance
      const isLab = sub.code.endsWith("L") || sub.key.includes("LAB") || sub.key === "SEMINARS";
      const isES = sub.key === "ES";

      let internalMarks, externalMarks, totalMarks, grade;

      if (isES) {
        internalMarks = 25;
        externalMarks = 45;
        totalMarks = 70;
        grade = "COMPLETED";
      } else if (isLab) {
        const ratio = conducted > 0 ? attended / conducted : 0.85;
        internalMarks = Math.round(20 + ratio * 9); // out of 30
        externalMarks = Math.round(42 + ratio * 27); // out of 70
        totalMarks = internalMarks + externalMarks;
        grade = totalMarks >= 85 ? "O" : totalMarks >= 75 ? "A+" : totalMarks >= 65 ? "A" : totalMarks >= 55 ? "B+" : "B";
      } else {
        const ratio = conducted > 0 ? attended / conducted : 0.80;
        internalMarks = Math.round(18 + ratio * 10); // out of 30
        externalMarks = Math.round(35 + ratio * 32); // out of 70
        totalMarks = internalMarks + externalMarks;
        grade = totalMarks >= 85 ? "O" : totalMarks >= 75 ? "A+" : totalMarks >= 65 ? "A" : totalMarks >= 55 ? "B+" : "B";
      }

      insertMarks.run(
        sId,
        "II Year I Sem",
        sub.code,
        sub.name,
        internalMarks,
        externalMarks,
        totalMarks,
        sub.credits,
        grade,
        "PASS"
      );
    });

    // Clearance Checklists
    const isGoodAttendance = st.pct >= 75.0;
    const checklistItems = [
      ["Library Textbook Return", "Return issued semester reference textbooks to Central Library", st.sNo % 4 === 0 ? "pending" : "clear", "2026-10-25"],
      ["Tuition Fee Clearance", "Clear odd-semester fee dues with Accounts Section", st.sNo % 6 === 0 ? "pending" : "clear", "2026-10-28"],
      ["Condonation & Attendance Rule", isGoodAttendance ? "Attendance above 75% — Eligible for SEE" : "Below 75% — Submit medical/mentor condonation form", isGoodAttendance ? "clear" : "pending", "2026-10-20"],
      ["Skill Lab Project Submission", "Submit certified Lab Record to Mrs. T. Sai Priyanka", "clear", "2026-10-30"]
    ];

    checklistItems.forEach(([name, desc, status, dueDate]) => {
      insertChecklist.run(sId, name, desc, status, dueDate);
    });
  });

  // Seed Announcements
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, description, type, date, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAnnouncement.run(
    "CSE-G Attendance Review (16-09-2026 to 30-09-2026)",
    "Official cumulative attendance sheet for II/I Sem Section-G published by Class Incharge Mrs. T. Sai Priyanka. Students below 75% must meet incharge immediately.",
    "attendance",
    "2026-10-01",
    1
  );
  insertAnnouncement.run(
    "II B.Tech I Sem Mid-Term Examinations",
    "CIE-I examination schedule for CSE-G is released. Courses covered: DM, SE, JAVA, COA, DBMS, and Lab Continuous Evaluations.",
    "exam",
    "2026-10-05",
    1
  );
  insertAnnouncement.run(
    "Skill Development Lab & Java Lab Project Work",
    "All CSE-G students must complete their weekly programming lab exercises and get records signed.",
    "general",
    "2026-10-08",
    1
  );

  // Seed Official Weekly Timetable specifically for CSE-G from photo
  const insertWeekly = db.prepare(`
    INSERT INTO weekly_timetable (day, period, time_slot, start_time, end_time, subject, code, name, faculty, room)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  timetableWeekly.forEach((item) => {
    insertWeekly.run(
      item.day, item.period, item.timeSlot, item.startTime, item.endTime,
      item.subject, item.code, item.name, item.faculty, item.room
    );
  });

  console.log(`[Database] Successfully populated ${studentsList.length} official CSE-G students with subjects & attendance!`);
  console.log(`[Database] Populated ${timetableWeekly.length} authentic weekly timetable periods for Room MG 107.`);
}
