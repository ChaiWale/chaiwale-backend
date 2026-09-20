import { getSupabaseAdminClient, getSupabaseClient } from '../../config/supabase.config';

export interface CateringEnquiryInput {
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  serviceType: 'OFFICE_LUNCH' | 'BHANDARA' | 'EVENT_BULK' | 'CUSTOM_EVENT';
  headcount: number;
  eventDate?: string;
  requirements?: string;
}

export interface CateringEnquiryRecord extends CateringEnquiryInput {
  id: string;
  leadNumber: string;
  status: string;
  createdAt: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CateringRepository {
  public static async createEnquiry(input: CateringEnquiryInput): Promise<{ id: string; leadNumber: string }> {
    const client = getSupabaseAdminClient() || getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized.');
    }

    const leadNumber = `CAT-${Date.now().toString().slice(-6)}`;

    const { data, error } = await client
      .from('catering_enquiries')
      .insert({
        lead_number: leadNumber,
        customer_name: input.customerName,
        phone: input.phone,
        email: input.email || null,
        company_name: input.companyName || null,
        service_type: input.serviceType,
        headcount: input.headcount,
        event_date: input.eventDate || null,
        requirements: input.requirements || null,
        status: 'NEW'
      })
      .select('id, lead_number')
      .single();

    if (error || !data) {
      throw new Error(`Database error saving catering enquiry: ${error?.message || 'Insertion failed'}`);
    }

    return {
      id: data.id,
      leadNumber: data.lead_number
    };
  }

  public static async getLeads(limit = 25): Promise<CateringEnquiryRecord[]> {
    const client = getSupabaseAdminClient() || getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized.');
    }

    const { data, error } = await client
      .from('catering_enquiries')
      .select('id, lead_number, customer_name, phone, email, company_name, service_type, headcount, event_date, requirements, status, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(1, limit), 100));

    if (error) {
      throw new Error(`Database error fetching catering leads: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      leadNumber: d.lead_number,
      customerName: d.customer_name,
      phone: d.phone,
      email: d.email,
      companyName: d.company_name,
      serviceType: d.service_type,
      headcount: d.headcount,
      eventDate: d.event_date,
      requirements: d.requirements,
      status: d.status,
      createdAt: d.created_at
    }));
  }

  public static async updateLeadStatus(leadId: string, status: string): Promise<boolean> {
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Supabase admin client not initialized.');
    }

    const isUuid = UUID_REGEX.test(leadId.trim());
    let query = client
      .from('catering_enquiries')
      .update({ status, updated_at: new Date().toISOString() });

    if (isUuid) {
      query = query.or(`id.eq.${leadId.trim()},lead_number.eq.${leadId.trim()}`);
    } else {
      query = query.eq('lead_number', leadId.trim());
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Database error updating catering lead status: ${error.message}`);
    }

    return true;
  }
}
