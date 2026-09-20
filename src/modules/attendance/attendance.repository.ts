import { getSupabaseAdminClient } from '../../config/supabase.config';
import { AttendanceStatusCode } from './attendance.types';

export interface AttendanceRecordInput {
  staffName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusCode;
  notes?: string;
}

export class AttendanceRepository {
  public static async markAttendance(records: AttendanceRecordInput[]): Promise<boolean> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return false;
    }

    const payload = records.map((r) => ({
      staff_name: r.staffName,
      date: r.date,
      status: r.status,
      notes: r.notes || null
    }));

    const { error } = await admin
      .from('staff_attendance')
      .upsert(payload, { onConflict: 'staff_name,date' });

    if (error) {
      throw new Error(`Database error saving attendance: ${error.message}`);
    }

    return true;
  }

  public static async getMonthlyRoster(month: number, year: number): Promise<unknown[]> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return [];
    }

    // Accurate calculation of the month's last day (e.g. 28/29 for Feb, 30 for Sep, 31 for Oct)
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await admin
      .from('staff_attendance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Database error fetching attendance: ${error.message}`);
    }

    return data || [];
  }
}
