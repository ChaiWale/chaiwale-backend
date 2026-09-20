/**
 * Attendance Types - Simple Excel-style Monthly Grid
 * P = Present
 * A = Absent
 * L = Leave
 * HD = Half Day
 */

export type AttendanceStatusCode = 'P' | 'A' | 'L' | 'HD';

export interface DailyAttendanceRecord {
  day: number; // 1 - 31
  status: AttendanceStatusCode;
  notes?: string;
}

export interface MonthlyStaffAttendance {
  staffId: string;
  staffName: string;
  month: number; // 1 - 12
  year: number;
  records: DailyAttendanceRecord[];
  totals?: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
  };
}
