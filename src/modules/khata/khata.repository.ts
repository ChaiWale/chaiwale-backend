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

const LOCAL_STORE_FILE = path.join(__dirname, '../../../../data/khatabook_store.json');

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
      offices: [
        {
          id: 'off-demo-1',
          name: 'Sharma Ji & Associates',
          phone: '9811223344',
          company_name: 'Sharma Law Office',
          floor_unit: 'Cabin 204, 2nd Floor',
          notes: 'Chai sutta daily ledger, settles on 1st of every month',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'off-demo-2',
          name: 'Tech Mahindra Support Team',
          phone: '8800410441',
          company_name: 'Tech Mahindra',
          floor_unit: '4th Floor, Vardhman Plaza',
          notes: 'Daily 10-15 chai + biscuits, weekly Friday settlement',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      entries: [
        {
          id: 'ent-demo-1',
          office_id: 'off-demo-2',
          date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          item_name: 'Chai',
          quantity: 8,
          unit_price: 12,
          total_amount: 96,
          notes: 'Morning tea',
          created_at: new Date().toISOString()
        },
        {
          id: 'ent-demo-2',
          office_id: 'off-demo-2',
          date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          item_name: 'Bun Maska',
          quantity: 2,
          unit_price: 25,
          total_amount: 50,
          notes: 'Snacks',
          created_at: new Date().toISOString()
        },
        {
          id: 'ent-demo-3',
          office_id: 'off-demo-2',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          item_name: 'Chai',
          quantity: 10,
          unit_price: 12,
          total_amount: 120,
          notes: 'Evening tea',
          created_at: new Date().toISOString()
        },
        {
          id: 'ent-demo-4',
          office_id: 'off-demo-2',
          date: new Date().toISOString().split('T')[0],
          item_name: 'Veg Thali',
          quantity: 2,
          unit_price: 99,
          total_amount: 198,
          notes: 'Lunch',
          created_at: new Date().toISOString()
        }
      ],
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
  public static async getOffices(): Promise<
    (KhataOfficeRecord & {
      total_consumption: number;
      total_payments: number;
      balance_due: number;
      last_entry_date?: string;
    })[]
  > {
    const store = ensureLocalStore();
    return store.offices.map((off) => {
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
  }

  public static async createOffice(input: {
    name: string;
    phone: string;
    company_name?: string;
    floor_unit?: string;
    notes?: string;
  }): Promise<KhataOfficeRecord> {
    const store = ensureLocalStore();
    const id = `off-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOffice: KhataOfficeRecord = {
      id,
      name: input.name.trim(),
      phone: input.phone.trim().replace(/\D/g, ''),
      company_name: input.company_name?.trim() || undefined,
      floor_unit: input.floor_unit?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.offices.push(newOffice);
    saveLocalStore(store);
    return newOffice;
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
}
