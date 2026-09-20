import fs from 'fs';
import path from 'path';
import { getSupabaseAdminClient } from '../../config/supabase.config';

export interface KhataOfficeRecord {
  id: string;
  name: string;
  phone: string;
  company_name?: string;
  floor_unit?: string;
  notes?: string;
  client_pin?: string;
  created_at: string;
  updated_at: string;
}

export interface KhataEntryRecord {
  id: string;
  office_id: string;
  date: string; // YYYY-MM-DD
  item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
  created_at: string;
}

export interface KhataPaymentRecord {
  id: string;
  office_id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  payment_mode: string; // 'CASH' | 'UPI' | 'ONLINE'
  notes?: string;
  created_at: string;
}

const LOCAL_STORE_FILE = path.resolve(__dirname, '../../../data/khatabook_store.json');

function ensureLocalStore(): {
  offices: KhataOfficeRecord[];
  entries: KhataEntryRecord[];
  payments: KhataPaymentRecord[];
} {
  try {
    const dir = path.dirname(LOCAL_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORE_FILE)) {
      const initial = { offices: [], entries: [], payments: [] };
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { offices: [], entries: [], payments: [] };
  }
}

function saveLocalStore(data: {
  offices: KhataOfficeRecord[];
  entries: KhataEntryRecord[];
  payments: KhataPaymentRecord[];
}) {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[KHATA] Local store write skipped (serverless read-only):', err.message);
  }
}

export class KhataRepository {
  public static generatePin(): string {
    // 4-digit numerical PIN (1000 - 9999)
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  public static async getOffices(): Promise<
    (KhataOfficeRecord & {
      total_consumption: number;
      total_payments: number;
      balance_due: number;
      last_entry_date?: string;
    })[]
  > {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data: offices, error: offErr } = await supabase
          .from('khata_offices')
          .select('*')
          .order('created_at', { ascending: false });

        if (offErr) throw offErr;

        const { data: entries, error: entErr } = await supabase
          .from('khata_entries')
          .select('*');

        if (entErr) throw entErr;

        const { data: payments, error: payErr } = await supabase
          .from('khata_payments')
          .select('*');

        if (payErr) throw payErr;

        const allEntries = entries || [];
        const allPayments = payments || [];

        return (offices || []).map((off) => {
          const offEntries = allEntries.filter((e) => e.office_id === off.id);
          const offPayments = allPayments.filter((p) => p.office_id === off.id);
          const total_consumption = offEntries.reduce((s, e) => s + Number(e.total_amount || 0), 0);
          const total_payments = offPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
          const balance_due = total_consumption - total_payments;
          const sortedEntries = [...offEntries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          const last_entry_date = sortedEntries[0]?.date;

          return {
            id: off.id,
            name: off.name,
            phone: off.phone,
            company_name: off.company_name || undefined,
            floor_unit: off.floor_unit || undefined,
            notes: off.notes || undefined,
            client_pin: off.client_pin || undefined,
            created_at: off.created_at,
            updated_at: off.updated_at,
            total_consumption,
            total_payments,
            balance_due,
            last_entry_date
          };
        });
      } catch (err: any) {
        console.error('[KHATA] Supabase getOffices error, falling back to local:', err.message);
      }
    }

    const store = ensureLocalStore();
    let hasUpdatedPin = false;

    const result = store.offices.map((off) => {
      if (!off.client_pin) {
        off.client_pin = KhataRepository.generatePin();
        hasUpdatedPin = true;
      }

      const entries = store.entries.filter((e) => e.office_id === off.id);
      const payments = store.payments.filter((p) => p.office_id === off.id);
      const total_consumption = entries.reduce((s, e) => s + Number(e.total_amount), 0);
      const total_payments = payments.reduce((s, p) => s + Number(p.amount), 0);
      const balance_due = total_consumption - total_payments;
      const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
      const last_entry_date = sortedEntries[0]?.date;

      return {
        ...off,
        total_consumption,
        total_payments,
        balance_due,
        last_entry_date
      };
    });

    if (hasUpdatedPin) {
      saveLocalStore(store);
    }

    return result;
  }

  public static async createOffice(input: {
    name: string;
    phone: string;
    company_name?: string;
    floor_unit?: string;
    notes?: string;
    client_pin?: string;
  }): Promise<KhataOfficeRecord> {
    const id = `off-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = (input.client_pin && input.client_pin.trim())
      ? input.client_pin.trim().toUpperCase()
      : KhataRepository.generatePin();

    const newOffice: KhataOfficeRecord = {
      id,
      name: input.name.trim(),
      phone: input.phone.trim().replace(/\D/g, ''),
      company_name: input.company_name?.trim() || undefined,
      floor_unit: input.floor_unit?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      client_pin: pin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase.from('khata_offices').insert([newOffice]);
      if (error) {
        console.error('[KHATA] Error creating office in Supabase:', error.message);
        throw error;
      }
      return newOffice;
    }

    const store = ensureLocalStore();
    store.offices.push(newOffice);
    saveLocalStore(store);
    return newOffice;
  }

  public static async findOrCreateOffice(criteria: {
    id?: string;
    phone?: string;
    name?: string;
    company_name?: string;
    floor_unit?: string;
  }): Promise<KhataOfficeRecord | null> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      if (criteria.id) {
        const { data } = await supabase.from('khata_offices').select('*').eq('id', criteria.id).maybeSingle();
        if (data) return data;
      }
      const cleanPhone = criteria.phone ? criteria.phone.trim().replace(/\D/g, '').slice(-10) : '';
      if (cleanPhone && cleanPhone.length >= 7) {
        const { data } = await supabase.from('khata_offices').select('*').ilike('phone', `%${cleanPhone}`).maybeSingle();
        if (data) return data;
      }
      if (criteria.name && criteria.name.trim()) {
        const { data } = await supabase.from('khata_offices').select('*').ilike('name', criteria.name.trim()).maybeSingle();
        if (data) return data;
      }
      if (criteria.name && criteria.phone && criteria.phone.trim().replace(/\D/g, '').length >= 7) {
        return this.createOffice({
          name: criteria.name,
          phone: criteria.phone,
          company_name: criteria.company_name,
          floor_unit: criteria.floor_unit,
          notes: 'Auto-registered via Credit Billing'
        });
      }
      return null;
    }

    const store = ensureLocalStore();
    if (criteria.id) {
      const byId = store.offices.find((o) => o.id === criteria.id);
      if (byId) return byId;
    }
    const cleanPhone = criteria.phone ? criteria.phone.trim().replace(/\D/g, '').slice(-10) : '';
    if (cleanPhone && cleanPhone.length >= 7) {
      const byPhone = store.offices.find((o) => o.phone.replace(/\D/g, '').endsWith(cleanPhone));
      if (byPhone) return byPhone;
    }
    if (criteria.name && criteria.name.trim()) {
      const normName = criteria.name.trim().toLowerCase();
      const byName = store.offices.find((o) => o.name.toLowerCase() === normName);
      if (byName) return byName;
    }
    if (criteria.name && criteria.phone && criteria.phone.trim().replace(/\D/g, '').length >= 7) {
      return this.createOffice({
        name: criteria.name,
        phone: criteria.phone,
        company_name: criteria.company_name,
        floor_unit: criteria.floor_unit,
        notes: 'Auto-registered via Credit Billing'
      });
    }
    return null;
  }

  public static async addEntry(input: {
    office_id: string;
    date: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }): Promise<KhataEntryRecord> {
    const id = `ent-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qty = Number(input.quantity);
    const price = Number(input.unit_price);
    const total_amount = Math.round(qty * price);

    const newEntry: KhataEntryRecord = {
      id,
      office_id: input.office_id,
      date: input.date || new Date().toISOString().split('T')[0],
      item_name: input.item_name.trim(),
      quantity: qty,
      unit_price: price,
      total_amount,
      notes: input.notes?.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data: office } = await supabase.from('khata_offices').select('id').eq('id', input.office_id).maybeSingle();
      if (!office) {
        throw new Error(`Office with id '${input.office_id}' not found`);
      }
      const { error } = await supabase.from('khata_entries').insert([newEntry]);
      if (error) {
        console.error('[KHATA] Error adding entry to Supabase:', error.message);
        throw error;
      }
      return newEntry;
    }

    const store = ensureLocalStore();
    const office = store.offices.find((o) => o.id === input.office_id);
    if (!office) {
      throw new Error(`Office with id '${input.office_id}' not found`);
    }

    store.entries.push(newEntry);
    saveLocalStore(store);
    return newEntry;
  }

  public static async deleteEntry(id: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase.from('khata_entries').delete().eq('id', id);
      if (error) {
        console.error('[KHATA] Error deleting entry from Supabase:', error.message);
        return false;
      }
      return true;
    }

    const store = ensureLocalStore();
    const idx = store.entries.findIndex((e) => e.id === id);
    if (idx !== -1) {
      store.entries.splice(idx, 1);
      saveLocalStore(store);
      return true;
    }
    return false;
  }

  public static async addPayment(input: {
    office_id: string;
    date: string;
    amount: number;
    payment_mode: string;
    notes?: string;
  }): Promise<KhataPaymentRecord> {
    const id = `pay-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: KhataPaymentRecord = {
      id,
      office_id: input.office_id,
      date: input.date || new Date().toISOString().split('T')[0],
      amount: Number(input.amount),
      payment_mode: input.payment_mode || 'CASH',
      notes: input.notes?.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data: office } = await supabase.from('khata_offices').select('id').eq('id', input.office_id).maybeSingle();
      if (!office) {
        throw new Error(`Office with id '${input.office_id}' not found`);
      }
      const { error } = await supabase.from('khata_payments').insert([newPayment]);
      if (error) {
        console.error('[KHATA] Error adding payment to Supabase:', error.message);
        throw error;
      }
      return newPayment;
    }

    const store = ensureLocalStore();
    const office = store.offices.find((o) => o.id === input.office_id);
    if (!office) {
      throw new Error(`Office with id '${input.office_id}' not found`);
    }

    store.payments.push(newPayment);
    saveLocalStore(store);
    return newPayment;
  }

  public static async getOfficeStatement(
    office_id: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    office: KhataOfficeRecord;
    entries: KhataEntryRecord[];
    payments: KhataPaymentRecord[];
    dateGroups: {
      date: string;
      items: KhataEntryRecord[];
      dateTotal: number;
    }[];
    totalConsumption: number;
    totalPayments: number;
    balanceDue: number;
    whatsappText: string;
  }> {
    const supabase = getSupabaseAdminClient();
    let office: KhataOfficeRecord | null = null;
    let filteredEntries: KhataEntryRecord[] = [];
    let filteredPayments: KhataPaymentRecord[] = [];

    if (supabase) {
      try {
        const { data: officeData, error: offErr } = await supabase
          .from('khata_offices')
          .select('*')
          .eq('id', office_id)
          .maybeSingle();

        if (offErr || !officeData) {
          throw new Error(`Office with id '${office_id}' not found`);
        }
        office = officeData;

        let entQuery = supabase.from('khata_entries').select('*').eq('office_id', office_id);
        let payQuery = supabase.from('khata_payments').select('*').eq('office_id', office_id);

        if (startDate) {
          entQuery = entQuery.gte('date', startDate);
          payQuery = payQuery.gte('date', startDate);
        }
        if (endDate) {
          entQuery = entQuery.lte('date', endDate);
          payQuery = payQuery.lte('date', endDate);
        }

        const [entRes, payRes] = await Promise.all([
          entQuery.order('date', { ascending: true }),
          payQuery.order('date', { ascending: true })
        ]);

        filteredEntries = (entRes.data || []).map((e: any) => ({
          ...e,
          quantity: Number(e.quantity),
          unit_price: Number(e.unit_price),
          total_amount: Number(e.total_amount)
        }));

        filteredPayments = (payRes.data || []).map((p: any) => ({
          ...p,
          amount: Number(p.amount)
        }));
      } catch (err: any) {
        console.error('[KHATA] Supabase getOfficeStatement failed, falling back:', err.message);
      }
    }

    if (!office) {
      const store = ensureLocalStore();
      const localOffice = store.offices.find((o) => o.id === office_id);
      if (!localOffice) {
        throw new Error(`Office with id '${office_id}' not found`);
      }
      office = localOffice;
      filteredEntries = store.entries.filter((e) => e.office_id === office_id);
      filteredPayments = store.payments.filter((p) => p.office_id === office_id);

      if (startDate) {
        filteredEntries = filteredEntries.filter((e) => e.date >= startDate);
        filteredPayments = filteredPayments.filter((p) => p.date >= startDate);
      }
      if (endDate) {
        filteredEntries = filteredEntries.filter((e) => e.date <= endDate);
        filteredPayments = filteredPayments.filter((p) => p.date <= endDate);
      }

      filteredEntries.sort((a, b) => a.date.localeCompare(b.date));
      filteredPayments.sort((a, b) => a.date.localeCompare(b.date));
    }

    // Group by date
    const dateMap: { [date: string]: KhataEntryRecord[] } = {};
    for (const ent of filteredEntries) {
      if (!dateMap[ent.date]) dateMap[ent.date] = [];
      dateMap[ent.date].push(ent);
    }

    const dateGroups = Object.keys(dateMap)
      .sort()
      .map((d) => ({
        date: d,
        items: dateMap[d],
        dateTotal: dateMap[d].reduce((sum, item) => sum + item.total_amount, 0)
      }));

    const totalConsumption = filteredEntries.reduce((s, e) => s + e.total_amount, 0);
    const totalPayments = filteredPayments.reduce((s, p) => s + p.amount, 0);
    const balanceDue = totalConsumption - totalPayments;

    // Build beautiful WhatsApp statement text
    let whatsappText = `☕ *CHAIWALE — CANTEEN KHATA STATEMENT*\n`;
    whatsappText += `━━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappText += `🏢 *Client / Office:* ${office.name}\n`;
    if (office.company_name) whatsappText += `📍 *Company:* ${office.company_name} (${office.floor_unit || ''})\n`;
    whatsappText += `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n`;
    whatsappText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    whatsappText += `*📋 DAILY CONSUMPTION BREAKDOWN:*\n`;

    if (dateGroups.length === 0) {
      whatsappText += `_No pending consumption items recorded._\n`;
    } else {
      for (const group of dateGroups) {
        whatsappText += `\n🗓️ *Date: ${group.date}* (Day Total: ₹${group.dateTotal})\n`;
        for (const item of group.items) {
          whatsappText += `  • ${item.quantity}x ${item.item_name} @ ₹${item.unit_price} = ₹${item.total_amount}\n`;
        }
      }
    }

    whatsappText += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappText += `📊 *SUMMARY:*\n`;
    whatsappText += `• Total Consumption: ₹${totalConsumption}\n`;
    if (totalPayments > 0) {
      whatsappText += `• Total Paid/Advance: ₹${totalPayments}\n`;
    }
    whatsappText += `💰 *TOTAL BALANCE DUE: ₹${balanceDue}*\n`;
    whatsappText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    whatsappText += `💳 *Pay Online (UPI / Paytm / GPay):*\n`;
    whatsappText += `UPI ID: paytmqr28100505010115gsv3315o55@paytm\n\n`;
    whatsappText += `_Shukriya! Chaiwale Canteen Service_\n`;
    whatsappText += `📞 Helpline: +91 8800410441 / +91 93101 12564`;

    return {
      office,
      entries: filteredEntries,
      payments: filteredPayments,
      dateGroups,
      totalConsumption,
      totalPayments,
      balanceDue,
      whatsappText
    };
  }

  /**
   * Customer self-lookup by phone + PIN (public route)
   * Returns a limited view: name, balance due, last 15 entries
   */
  public static async customerLookup(phone: string, pin: string): Promise<{
    name: string;
    company?: string;
    balanceDue: number;
    totalConsumption: number;
    totalPayments: number;
    recentEntries: { date: string; item_name: string; quantity: number; total_amount: number }[];
  } | null> {
    const normalizePhone = (p: string) => p.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '').slice(-10);
    const cleanPhone = normalizePhone(phone);

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data: offices } = await supabase
          .from('khata_offices')
          .select('*')
          .eq('client_pin', pin);

        const office = (offices || []).find((o: any) => normalizePhone(o.phone).endsWith(cleanPhone));
        if (office) {
          const [entRes, payRes] = await Promise.all([
            supabase.from('khata_entries').select('*').eq('office_id', office.id).order('date', { ascending: false }),
            supabase.from('khata_payments').select('*').eq('office_id', office.id)
          ]);

          const entries: KhataEntryRecord[] = (entRes.data || []).map((e: any) => ({
            ...e,
            quantity: Number(e.quantity),
            unit_price: Number(e.unit_price),
            total_amount: Number(e.total_amount)
          }));
          const payments: KhataPaymentRecord[] = (payRes.data || []).map((p: any) => ({
            ...p,
            amount: Number(p.amount)
          }));

          const totalConsumption = entries.reduce((s, e) => s + e.total_amount, 0);
          const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
          const balanceDue = Math.max(0, totalConsumption - totalPayments);

          const recentEntries = entries.slice(0, 15).map((e) => ({
            date: e.date,
            item_name: e.item_name,
            quantity: e.quantity,
            total_amount: e.total_amount
          }));

          return {
            name: office.name,
            company: office.company_name,
            balanceDue,
            totalConsumption,
            totalPayments,
            recentEntries
          };
        }
      } catch (err: any) {
        console.error('[KHATA] Supabase customerLookup error, falling back:', err.message);
      }
    }

    const store = ensureLocalStore();
    const office = store.offices.find((o: any) =>
      normalizePhone(o.phone).endsWith(cleanPhone) && o.client_pin === pin
    );
    if (!office) return null;

    const entries = store.entries.filter((e: KhataEntryRecord) => e.office_id === office.id);
    const payments = store.payments.filter((p: KhataPaymentRecord) => p.office_id === office.id);
    const totalConsumption = entries.reduce((s: number, e: KhataEntryRecord) => s + e.total_amount, 0);
    const totalPayments = payments.reduce((s: number, p: KhataPaymentRecord) => s + p.amount, 0);
    const balanceDue = Math.max(0, totalConsumption - totalPayments);

    const recentEntries = [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15)
      .map((e) => ({ date: e.date, item_name: e.item_name, quantity: e.quantity, total_amount: e.total_amount }));

    return {
      name: office.name,
      company: (office as any).company_name,
      balanceDue,
      totalConsumption,
      totalPayments,
      recentEntries
    };
  }

  /**
   * Admin — set client PIN for an office
   */
  public static async setClientPin(officeId: string, pin: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase
        .from('khata_offices')
        .update({ client_pin: pin, updated_at: new Date().toISOString() })
        .eq('id', officeId);
      if (error) {
        console.error('[KHATA] Error setting PIN in Supabase:', error.message);
        return false;
      }
      return true;
    }

    const store = ensureLocalStore();
    const office = store.offices.find((o: KhataOfficeRecord) => o.id === officeId) as any;
    if (!office) return false;
    office.client_pin = pin;
    office.updated_at = new Date().toISOString();
    saveLocalStore(store);
    return true;
  }

  /**
   * Admin — delete office account and associated entries/payments
   */
  public static async deleteOffice(officeId: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase.from('khata_offices').delete().eq('id', officeId);
      if (error) {
        console.error('[KHATA] Error deleting office in Supabase:', error.message);
        return false;
      }
      return true;
    }

    const store = ensureLocalStore();
    const idx = store.offices.findIndex((o) => o.id === officeId);
    if (idx === -1) return false;
    store.offices.splice(idx, 1);
    store.entries = store.entries.filter((e) => e.office_id !== officeId);
    store.payments = store.payments.filter((p) => p.office_id !== officeId);
    saveLocalStore(store);
    return true;
  }

  /**
   * Admin — update office details
   */
  public static async updateOffice(
    officeId: string,
    data: { name?: string; phone?: string; company_name?: string; floor_unit?: string; notes?: string }
  ): Promise<KhataOfficeRecord | null> {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.phone !== undefined) updatePayload.phone = data.phone.trim().replace(/\D/g, '');
    if (data.company_name !== undefined) updatePayload.company_name = data.company_name.trim();
    if (data.floor_unit !== undefined) updatePayload.floor_unit = data.floor_unit.trim();
    if (data.notes !== undefined) updatePayload.notes = data.notes.trim();

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data: updated, error } = await supabase
        .from('khata_offices')
        .update(updatePayload)
        .eq('id', officeId)
        .select()
        .single();

      if (error) {
        console.error('[KHATA] Error updating office in Supabase:', error.message);
        return null;
      }
      return updated;
    }

    const store = ensureLocalStore();
    const office = store.offices.find((o) => o.id === officeId);
    if (!office) return null;
    if (data.name !== undefined) office.name = data.name.trim();
    if (data.phone !== undefined) office.phone = data.phone.trim().replace(/\D/g, '');
    if (data.company_name !== undefined) office.company_name = data.company_name.trim();
    if (data.floor_unit !== undefined) office.floor_unit = data.floor_unit.trim();
    if (data.notes !== undefined) office.notes = data.notes.trim();
    office.updated_at = new Date().toISOString();
    saveLocalStore(store);
    return office;
  }

  /**
   * Admin — delete a payment record
   */
  public static async deletePayment(paymentId: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase.from('khata_payments').delete().eq('id', paymentId);
      if (error) {
        console.error('[KHATA] Error deleting payment in Supabase:', error.message);
        return false;
      }
      return true;
    }

    const store = ensureLocalStore();
    const idx = store.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) return false;
    store.payments.splice(idx, 1);
    saveLocalStore(store);
    return true;
  }
}
