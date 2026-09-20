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
  const dir = path.dirname(LOCAL_STORE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_STORE_FILE)) {
    const initial = {
      offices: [],
      entries: [],
      payments: []
    };
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
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
  fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
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
    const store = ensureLocalStore();
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
    // If not found and we have a valid name and phone, auto-create
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
    const store = ensureLocalStore();
    const office = store.offices.find((o) => o.id === input.office_id);
    if (!office) {
      throw new Error(`Office with id '${input.office_id}' not found`);
    }

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

    store.entries.push(newEntry);
    saveLocalStore(store);
    return newEntry;
  }

  public static async deleteEntry(id: string): Promise<boolean> {
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
    const store = ensureLocalStore();
    const office = store.offices.find((o) => o.id === input.office_id);
    if (!office) {
      throw new Error(`Office with id '${input.office_id}' not found`);
    }

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
    const store = ensureLocalStore();
    const office = store.offices.find((o) => o.id === office_id);
    if (!office) {
      throw new Error(`Office with id '${office_id}' not found`);
    }

    let filteredEntries = store.entries.filter((e) => e.office_id === office_id);
    let filteredPayments = store.payments.filter((p) => p.office_id === office_id);

    if (startDate) {
      filteredEntries = filteredEntries.filter((e) => e.date >= startDate);
      filteredPayments = filteredPayments.filter((p) => p.date >= startDate);
    }
    if (endDate) {
      filteredEntries = filteredEntries.filter((e) => e.date <= endDate);
      filteredPayments = filteredPayments.filter((p) => p.date <= endDate);
    }

    // Sort entries date ascending
    filteredEntries.sort((a, b) => a.date.localeCompare(b.date));
    filteredPayments.sort((a, b) => a.date.localeCompare(b.date));

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
   * Returns a limited view: name, balance due, last 10 entries
   */
  public static async customerLookup(phone: string, pin: string): Promise<{
    name: string;
    company?: string;
    balanceDue: number;
    totalConsumption: number;
    totalPayments: number;
    recentEntries: { date: string; item_name: string; quantity: number; total_amount: number }[];
  } | null> {
    const store = ensureLocalStore();
    // Normalize phone for comparison (strip spaces, dashes, +91 prefix)
    const normalizePhone = (p: string) => p.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '');
    const office = store.offices.find((o: any) =>
      normalizePhone(o.phone) === normalizePhone(phone) && o.client_pin === pin
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
    const store = ensureLocalStore();
    const office = store.offices.find((o: KhataOfficeRecord) => o.id === officeId) as any;
    if (!office) return false;
    office.client_pin = pin;
    office.updated_at = new Date().toISOString();
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
    return true;
  }

  /**
   * Admin — delete office account and associated entries/payments
   */
  public static async deleteOffice(officeId: string): Promise<boolean> {
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
    const store = ensureLocalStore();
    const idx = store.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) return false;
    store.payments.splice(idx, 1);
    saveLocalStore(store);
    return true;
  }
}

