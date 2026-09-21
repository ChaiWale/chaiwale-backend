import { CateringRepository, CateringEnquiryInput, CateringEnquiryRecord } from './catering.repository';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { emailService } from '../notifications/email/email.service';

function normalizeServiceType(type?: string): 'OFFICE_LUNCH' | 'BHANDARA' | 'EVENT_BULK' | 'CUSTOM_EVENT' {
  if (!type) return 'OFFICE_LUNCH';
  const u = type.toUpperCase().replace(/\s+/g, '_');
  if (u.includes('BHANDARA')) return 'BHANDARA';
  if (u.includes('BULK') || u.includes('EVENT') || u.includes('PARTY')) return 'EVENT_BULK';
  if (u.includes('CUSTOM') || u.includes('BIHARI')) return 'CUSTOM_EVENT';
  return 'OFFICE_LUNCH';
}

export const CATERING_STAGES = [
  'NEW',
  'CONTACTED',
  'REQUIREMENT_CONFIRMED',
  'QUOTE_SENT',
  'NEGOTIATION',
  'ADVANCE_RECEIVED',
  'CONFIRMED',
  'COMPLETED',
  'LOST'
] as const;

export class CateringService {
  public static async submitEnquiry(input: CateringEnquiryInput): Promise<{ id: string; leadNumber: string }> {
    const normalizedType = normalizeServiceType(input.serviceType);
    const result = await CateringRepository.createEnquiry({
      ...input,
      serviceType: normalizedType
    });

    // Automatically send lead notification email to operations (chaiwale528@gmail.com) via Resend
    emailService.sendLeadNotification({
      leadType: normalizedType === 'BHANDARA' ? 'BHANDARA' : 'CATERING',
      referenceId: result.leadNumber,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      companyName: input.companyName,
      planOrService: input.serviceType || 'Catering / Bulk Order',
      headcountOrPeriod: input.headcount ? `${input.headcount} Guests / Headcount` : undefined,
      timingOrDate: input.eventDate,
      notes: input.requirements,
      receivedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }).then((res) => {
      console.log(`[CATERING LEAD EMAIL] Dispatched email for lead ${result.leadNumber}:`, res.success ? 'SUCCESS' : res.error);
    }).catch((err) => {
      console.error('[CATERING LEAD EMAIL ERROR]', err);
    });

    return result;
  }

  public static async getLeads(limit = 25): Promise<CateringEnquiryRecord[]> {
    return CateringRepository.getLeads(limit);
  }

  public static async updateLeadStatus(leadId: string, status: string): Promise<boolean> {
    const cleanStatus = status.toUpperCase().trim();
    if (!CATERING_STAGES.includes(cleanStatus as any)) {
      throw new Error(`Invalid catering status: ${status}. Must be one of: ${CATERING_STAGES.join(', ')}`);
    }
    return CateringRepository.updateLeadStatus(leadId, cleanStatus);
  }

  /**
   * Record Advance Payment for Catering Lead
   * Connects directly to the central financial system (payments & ledger)
   */
  public static async recordAdvancePayment(
    leadId: string,
    amount: number,
    paymentMode: 'CASH' | 'UPI' | 'CARD',
    transactionRef?: string
  ): Promise<{ paymentId: string; status: string }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    if (amount <= 0) {
      throw new Error('Advance payment amount must be greater than 0');
    }

    // 1. Fetch lead details
    const { data: lead, error: lErr } = await admin
      .from('catering_enquiries')
      .select('*')
      .eq('id', leadId)
      .single();

    if (lErr || !lead) {
      throw new Error(`Catering lead ${leadId} not found`);
    }

    // 2. Insert into payments table
    const { data: payData, error: payErr } = await admin
      .from('payments')
      .insert({
        amount,
        payment_mode: paymentMode,
        payment_status: 'SUCCESS',
        transaction_ref: transactionRef || null
      })
      .select('id')
      .single();

    if (payErr || !payData) {
      throw new Error(`Failed to record advance payment: ${payErr?.message}`);
    }

    // 3. Record into ledger
    await admin.from('ledger_entries').insert({
      payment_id: payData.id,
      entry_type: 'CREDIT',
      amount,
      balance_after: 0,
      reference_note: `Advance payment received for Catering Event (${lead.lead_number} - ${lead.customer_name}) via ${paymentMode}`
    });

    // 4. Update lead status to ADVANCE_RECEIVED
    await this.updateLeadStatus(leadId, 'ADVANCE_RECEIVED');

    return {
      paymentId: payData.id,
      status: 'ADVANCE_RECEIVED'
    };
  }
}
