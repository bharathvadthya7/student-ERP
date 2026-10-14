export interface Student {
  id: number;
  sNo: number;
  roll: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  first: string;
  surname: string;
  fullName: string;
  hallTicket: string;
  section: string;
  branch: string;
  yearSem: string;
  classIncharge: string;
  academicYear: string;
  studentId: string;
  totalConducted: number;
  totalAttended: number;
  attendance: number;
  cgpa: string;
  deptRank: number;
  collegeRank: number;
  avatar?: string | null;
}

export type PageId = "home" | "timetable" | "attendance" | "marks" | "status" | "downloads" | "students" | "profile";

export interface NavItem {
  id: PageId;
  icon: string;
  label: string;
}

export interface SubjectAttendance {
  id: number;
  student_id: number;
  subject_key: string;
  subject_code: string;
  subject_name: string;
  conducted: number;
  attended: number;
  percentage: number;
}

export interface AttendanceRecord {
  day: number;
  weekday: number;
  date: string;
  status: "present" | "absent" | "weekend" | "holiday";
}

export interface AttendanceStats {
  overallAttendance: number;
  totalConducted: number;
  totalAttended: number;
  monthAttendance: string | number;
  presentDays: number;
  absentDays: number;
  weekendDays: number;
  totalDays: number;
}

export interface TimetableSlot {
  id: number;
  day: string;
  period: number | string;
  time_slot: string;
  start_time: string;
  end_time: string;
  subject: string;
  code: string;
  name: string;
  faculty: string;
  room: string;
  status: "Completed" | "Ongoing" | "Upcoming" | "Scheduled";
}

export interface TimetableFacultySubject {
  code: string;
  key: string;
  name: string;
  faculty: string;
  credits: number;
}

export interface TimetableResponse {
  classInfo: ClassInfo;
  currentDay: string;
  selectedDay: string;
  currentTime: string;
  dailySchedule: TimetableSlot[];
  weeklyMatrix: Record<string, TimetableSlot[]>;
  subjects: TimetableFacultySubject[];
  periods: Array<{ period: number | string; timeSlot: string }>;
}

export interface MarkItem {
  id: number;
  student_id: number;
  semester: string;
  subject_code: string;
  subject_name: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  credits: number;
  grade: string;
  status: string;
}

export interface ChecklistItem {
  id: number;
  student_id: number;
  item_name: string;
  description: string;
  status: "clear" | "pending" | "review";
  due_date: string;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  type: "exam" | "attendance" | "fees" | "general";
  date: string;
  is_active: number;
}

export interface DirectoryMetrics {
  total: number;
  cseA: number;
  cseB: number;
  goodAttendance: number;
  lowAttendance: number;
}

export interface ClassInfo {
  institution: string;
  branch: string;
  section: string;
  yearSem: string;
  roomNo?: string;
  academicYear: string;
  wef?: string;
  classIncharge: string;
  dateRange: string;
}
