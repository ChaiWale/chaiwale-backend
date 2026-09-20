import { AttendanceRepository, AttendanceRecordInput } from './attendance.repository';

export class AttendanceService {
  public static async markAttendance(records: AttendanceRecordInput[]): Promise<boolean> {
    return AttendanceRepository.markAttendance(records);
  }

  public static async getMonthlyRoster(month: number, year: number): Promise<unknown[]> {
    return AttendanceRepository.getMonthlyRoster(month, year);
  }
}
