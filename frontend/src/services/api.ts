import {
  Student,
  SubjectAttendance,
  AttendanceRecord,
  AttendanceStats,
  TimetableSlot,
  TimetableResponse,
  MarkItem,
  ChecklistItem,
  Announcement,
  DirectoryMetrics,
  ClassInfo
} from "../types";

const rawBase = (import.meta as any).env?.VITE_API_BASE_URL;
export const API_BASE = rawBase
  ? rawBase.endsWith("/api")
    ? rawBase
    : `${rawBase.replace(/\/+$/, "")}/api`
  : "/api";

export async function checkSession(roll: string): Promise<Student> {
  const response = await fetch(`${API_BASE}/auth/me?roll=${encodeURIComponent(roll)}`);
  if (!response.ok) throw new Error("Session invalid");
  return response.json();
}

export async function loginStudent(rollNumber: string, password?: string): Promise<{ success: boolean; student: Student; token: string }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_number: rollNumber.trim().toUpperCase(),
      password: password ? password.trim() : rollNumber.trim().toUpperCase()
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Login failed. Please check your roll number.");
  }

  return response.json();
}

export async function getDashboardData(studentId: number): Promise<{
  student: Student;
  stats: {
    attendance: number;
    totalConducted: number;
    totalAttended: number;
    cgpa: string;
    deptRank: number;
    collegeRank: number;
    pendingClearances: number;
  };
  classInfo: ClassInfo;
  subjectAttendance: SubjectAttendance[];
  announcements: Announcement[];
  timetable: TimetableSlot[];
  checklists: ChecklistItem[];
}> {
  const response = await fetch(`${API_BASE}/dashboard/${studentId}`);
  if (!response.ok) throw new Error("Could not load dashboard data");
  return response.json();
}

export async function getAttendanceData(studentId: number, month: number = 8, year: number = 2026): Promise<{
  month: number;
  year: number;
  classInfo: ClassInfo;
  officialRecord: {
    conducted: number;
    attended: number;
    percentage: number;
    dateRange: string;
    incharge: string;
  };
  subjectAttendance: SubjectAttendance[];
  records: AttendanceRecord[];
  stats: AttendanceStats;
  timetable: TimetableSlot[];
}> {
  const response = await fetch(`${API_BASE}/attendance/${studentId}?month=${month}&year=${year}`);
  if (!response.ok) throw new Error("Could not load attendance records");
  return response.json();
}

export async function toggleDayAttendance(studentId: number, date: string, status: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/attendance/${studentId}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, status })
  });
  if (!response.ok) throw new Error("Failed to update attendance");
  return response.json();
}

export async function getMarksData(studentId: number): Promise<{
  student: Student;
  classInfo: ClassInfo;
  semester: string;
  subjects: MarkItem[];
  summary: {
    cgpa: string;
    totalCredits: number;
    averagePercentage: string;
    totalSubjects: number;
    resultStatus: string;
  };
}> {
  const response = await fetch(`${API_BASE}/marks/${studentId}`);
  if (!response.ok) throw new Error("Could not load marks data");
  return response.json();
}

export async function getStatusData(studentId: number): Promise<{
  student: Student;
  classInfo: ClassInfo;
  checklists: ChecklistItem[];
  academicStanding: {
    attendanceStatus: string;
    deptRank: number;
    collegeRank: number;
    classIncharge: string;
    conduct: string;
    admissionStatus: string;
  };
}> {
  const response = await fetch(`${API_BASE}/status/${studentId}`);
  if (!response.ok) throw new Error("Could not load student status");
  return response.json();
}

export async function toggleChecklistItem(studentId: number, itemId: number): Promise<{ success: boolean; item: ChecklistItem }> {
  const response = await fetch(`${API_BASE}/status/${studentId}/toggle-item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId })
  });
  if (!response.ok) throw new Error("Failed to update checklist item");
  return response.json();
}

export async function getStudentsDirectory(
  search: string = "",
  section: string = "All",
  attendance: string = "All"
): Promise<{ students: Student[]; classInfo: ClassInfo; metrics: DirectoryMetrics }> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (attendance !== "All") params.append("attendance", attendance);

  const response = await fetch(`${API_BASE}/students?${params.toString()}`);
  if (!response.ok) throw new Error("Could not fetch students directory");
  return response.json();
}

export async function getStudentDetails(id: number): Promise<{
  student: Student;
  classInfo: ClassInfo;
  marks: MarkItem[];
  checklists: ChecklistItem[];
  subjectAttendance: SubjectAttendance[];
}> {
  const response = await fetch(`${API_BASE}/students/${id}`);
  if (!response.ok) throw new Error("Could not fetch student details");
  return response.json();
}

export function getDocumentDownloadUrl(studentId: number, docType: string): string {
  return `${API_BASE}/documents/${studentId}/${docType}`;
}

export async function getTimetableData(day?: string): Promise<TimetableResponse> {
  const url = day ? `${API_BASE}/timetable?day=${encodeURIComponent(day)}` : `${API_BASE}/timetable`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load timetable");
  return response.json();
}
