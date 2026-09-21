import { getSupabaseAdminClient } from '../../config/supabase.config';

export interface CreateInvoiceInput {
  orderId?: string;
  corporateClientId?: string;
  customerId?: string;
  cateringQuoteId?: string;
  invoiceType: 'DIRECT' | 'CORPORATE_CREDIT' | 'CATERING';
  department?: string;
  customerName?: string;
  customerPhone?: string;
  issueDate?: string;
  paymentMode?: 'CASH' | 'UPI' | 'CREDIT' | 'CARD' | 'SPLIT';
  transactionRef?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  pdfStoragePath?: string;
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CREDIT' | 'CARD' | 'SPLIT';
  transactionRef?: string;
  notes?: string;
}

export interface RecordLedgerInput {
  corporateClientId?: string;
  customerId?: string;
  invoiceId?: string;
  paymentId?: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  balanceAfter: number;
  referenceNote: string;
}

export interface InvoiceFilters {
  status?: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'CANCELLED';
  clientId?: string;
  paymentMode?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export class BillingRepository {
  /**
   * Create an authoritative invoice in Supabase with atomic outstanding calculation
   */
  public static async createInvoice(input: CreateInvoiceInput): Promise<{
    id: string;
    invoiceNumber: string;
    status: string;
    paidAmount: number;
    outstandingAmount: number;
  }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const isCredit = input.paymentMode === 'CREDIT' || input.invoiceType === 'CORPORATE_CREDIT';

    const status = isCredit ? 'UNPAID' : 'PAID';
    const paidAmount = isCredit ? 0 : input.grandTotal;
    const outstandingAmount = isCredit ? input.grandTotal : 0;
    let issuedAt: string;
    if (input.issueDate) {
      const trimmed = input.issueDate.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const now = new Date();
        const d = new Date(trimmed);
        d.setUTCHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        issuedAt = d.toISOString();
      } else {
        const parsed = new Date(trimmed);
        issuedAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      }
    } else {
      issuedAt = new Date().toISOString();
    }

    const isValidUuid = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
    const validCorporateClientId = isValidUuid(input.corporateClientId) ? input.corporateClientId : null;

    // 1. Insert Invoice
    const { data: invData, error: invErr } = await admin
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: input.orderId || null,
        corporate_client_id: validCorporateClientId,
        catering_quote_id: input.cateringQuoteId || null,
        invoice_type: input.invoiceType,
        department: input.department || null,
        subtotal: input.subtotal,
        tax_amount: input.taxAmount,
        discount_amount: input.discountAmount,
        grand_total: input.grandTotal,
        paid_amount: paidAmount,
        outstanding_amount: outstandingAmount,
        status,
        issued_at: issuedAt,
        pdf_storage_path: input.pdfStoragePath || null
      })
      .select('id, invoice_number, status, paid_amount, outstanding_amount')
      .single();

    if (invErr || !invData) {
      throw new Error(`Database error creating invoice: ${invErr?.message || 'Insertion failed'}`);
    }

    // 2. If immediate payment (Cash/UPI), record payment row
    let paymentId: string | null = null;
    if (!isCredit && input.paymentMode) {
      const { data: payData, error: payErr } = await admin
        .from('payments')
        .insert({
          invoice_id: invData.id,
          order_id: input.orderId || null,
          amount: input.grandTotal,
          payment_mode: input.paymentMode,
          payment_status: 'SUCCESS',
          transaction_ref: input.transactionRef || null
        })
        .select('id')
        .single();

      if (!payErr && payData) {
        paymentId = payData.id;
      }
    }

    // 3. Ledger Synchronization for Corporate Credit or Customer Udhaar
    if (validCorporateClientId) {
      // Fetch current balance
      const { data: client } = await admin
        .from('corporate_clients')
        .select('outstanding_balance')
        .eq('id', validCorporateClientId)
        .single();

      const currentBalance = client ? Number(client.outstanding_balance || 0) : 0;
      const newBalance = isCredit ? currentBalance + input.grandTotal : currentBalance;

      // Update corporate outstanding balance
      if (isCredit) {
        await admin
          .from('corporate_clients')
          .update({ outstanding_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', validCorporateClientId);
      }

      // Record Ledger Debit Entry
      await admin.from('ledger_entries').insert({
        corporate_client_id: validCorporateClientId,
        invoice_id: invData.id,
        payment_id: paymentId,
        entry_type: 'DEBIT',
        amount: input.grandTotal,
        balance_after: newBalance,
        reference_note: isCredit
          ? `Credit Invoice ${invoiceNumber} issued (Department: ${input.department || 'General'})`
          : `Direct Invoice ${invoiceNumber} issued & paid via ${input.paymentMode}`
      });

      // If immediately paid, record corresponding Ledger Credit Entry
      if (!isCredit && paymentId) {
        await admin.from('ledger_entries').insert({
          corporate_client_id: validCorporateClientId,
          invoice_id: invData.id,
          payment_id: paymentId,
          entry_type: 'CREDIT',
          amount: input.grandTotal,
          balance_after: currentBalance,
          reference_note: `Payment received for Invoice ${invoiceNumber} via ${input.paymentMode}`
        });
      }
    }

    return {
      id: invData.id,
      invoiceNumber: invData.invoice_number,
      status: invData.status,
      paidAmount: Number(invData.paid_amount),
      outstandingAmount: Number(invData.outstanding_amount)
    };
  }

  /**
   * Atomic Payment Recording against an Invoice (Full or Partial)
   * Validates that payment cannot make invoice balance negative.
   */
  public static async recordPayment(input: RecordPaymentInput): Promise<{
    paymentId: string;
    invoiceNumber: string;
    status: string;
    paidAmount: number;
    outstandingAmount: number;
  }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    if (input.amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    // 1. Fetch current invoice state
    const { data: invoice, error: fetchErr } = await admin
      .from('invoices')
      .select('id, invoice_number, order_id, corporate_client_id, grand_total, paid_amount, outstanding_amount, status')
      .eq('id', input.invoiceId)
      .single();

    if (fetchErr || !invoice) {
      throw new Error(`Invoice not found: ${input.invoiceId}`);
    }

    const currentPaid = Number(invoice.paid_amount || 0);
    const currentOutstanding = Number(invoice.outstanding_amount !== undefined ? invoice.outstanding_amount : invoice.grand_total - currentPaid);

    if (currentOutstanding <= 0) {
      throw new Error(`Invoice ${invoice.invoice_number} is already fully paid.`);
    }

    // Atomic overpayment prevention rule
    if (input.amount > currentOutstanding) {
      throw new Error(
        `Payment amount (₹${input.amount}) exceeds invoice outstanding balance (₹${currentOutstanding}). Overpayments are strictly disallowed.`
      );
    }

    const newPaid = Number((currentPaid + input.amount).toFixed(2));
    const newOutstanding = Number((currentOutstanding - input.amount).toFixed(2));
    const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIALLY_PAID';

    // 2. Insert payment record
    const { data: payData, error: payErr } = await admin
      .from('payments')
      .insert({
        invoice_id: invoice.id,
        order_id: invoice.order_id || null,
        amount: input.amount,
        payment_mode: input.paymentMode,
        payment_status: 'SUCCESS',
        transaction_ref: input.transactionRef || null
      })
      .select('id')
      .single();

    if (payErr || !payData) {
      throw new Error(`Database error inserting payment: ${payErr?.message || 'Payment insertion failed'}`);
    }

    // 3. Atomically update invoice
    const { error: updateErr } = await admin
      .from('invoices')
      .update({
        paid_amount: newPaid,
        outstanding_amount: newOutstanding,
        status: newStatus
      })
      .eq('id', invoice.id);

    if (updateErr) {
      throw new Error(`Database error updating invoice balance: ${updateErr.message}`);
    }

    // 4. Update Corporate Client balance and Ledger if applicable
    if (invoice.corporate_client_id) {
      const { data: client } = await admin
        .from('corporate_clients')
        .select('outstanding_balance')
        .eq('id', invoice.corporate_client_id)
        .single();

      const currentClientBal = client ? Number(client.outstanding_balance || 0) : 0;
      const newClientBal = Number(Math.max(0, currentClientBal - input.amount).toFixed(2));

      await admin
        .from('corporate_clients')
        .update({ outstanding_balance: newClientBal, updated_at: new Date().toISOString() })
        .eq('id', invoice.corporate_client_id);

      await admin.from('ledger_entries').insert({
        corporate_client_id: invoice.corporate_client_id,
        invoice_id: invoice.id,
        payment_id: payData.id,
        entry_type: 'CREDIT',
        amount: input.amount,
        balance_after: newClientBal,
        reference_note: input.notes || `Payment of ₹${input.amount} received via ${input.paymentMode} for ${invoice.invoice_number}`
      });
    }

    return {
      paymentId: payData.id,
      invoiceNumber: invoice.invoice_number,
      status: newStatus,
      paidAmount: newPaid,
      outstandingAmount: newOutstanding
    };
  }

  /**
   * Fetch Invoices with status, date, and client filters
   */
  public static async getInvoices(filters: InvoiceFilters = {}): Promise<any[]> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    let query = admin
      .from('invoices')
      .select(`
        id,
        invoice_number,
        invoice_type,
        department,
        subtotal,
        tax_amount,
        discount_amount,
        grand_total,
        paid_amount,
        outstanding_amount,
        status,
        issued_at,
        pdf_storage_path,
        corporate_clients (
          id,
          company_name
        ),
        orders (
          id,
          order_number,
          order_type,
          payment_mode,
          delivery_address,
          order_items (
            item_name,
            unit_price,
            quantity,
            line_total
          )
        )
      `)
      .order('issued_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.clientId) {
      query = query.eq('corporate_client_id', filters.clientId);
    }
    if (filters.dateFrom) {
      query = query.gte('issued_at', `${filters.dateFrom}T00:00:00Z`);
    }
    if (filters.dateTo) {
      query = query.lte('issued_at', `${filters.dateTo}T23:59:59Z`);
    }
    const effectiveLimit = filters.limit ? Math.min(Math.max(1, filters.limit), 100) : 50;
    query = query.limit(effectiveLimit);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Database error fetching invoices: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch Single Invoice with Complete Line Items & Payments
   */
  public static async getInvoiceById(invoiceId: string): Promise<any | null> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId.trim());

    let query = admin
      .from('invoices')
      .select(`
        id,
        invoice_number,
        invoice_type,
        department,
        subtotal,
        tax_amount,
        discount_amount,
        grand_total,
        paid_amount,
        outstanding_amount,
        status,
        issued_at,
        pdf_storage_path,
        corporate_clients (
          id,
          company_name,
          gstin,
          billing_address
        ),
        orders (
          id,
          order_number,
          customer_id,
          delivery_address,
          payment_mode,
          customers (
            name,
            phone
          ),
          order_items (
            item_name,
            unit_price,
            quantity,
            line_total
          )
        ),
        payments (
          id,
          amount,
          payment_mode,
          payment_status,
          transaction_ref,
          paid_at
        )
      `);

    if (isUuid) {
      query = query.eq('id', invoiceId.trim());
    } else {
      query = query.eq('invoice_number', invoiceId.trim().toUpperCase());
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Database error fetching invoice details: ${error.message}`);
    }

    return data;
  }

  /**
   * Fetch Ledger Entries
   */
  public static async getLedger(corporateClientId?: string, limit = 50): Promise<any[]> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    let query = admin
      .from('ledger_entries')
      .select(`
        id,
        entry_type,
        amount,
        balance_after,
        reference_note,
        created_at,
        corporate_clients (
          id,
          company_name
        ),
        invoices (
          invoice_number
        ),
        payments (
          payment_mode,
          transaction_ref
        )
      `)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(1, limit), 100));

    if (corporateClientId) {
      query = query.eq('corporate_client_id', corporateClientId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Database error fetching ledger: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch Corporate Client Statement
   */
  public static async getCorporateStatement(corporateClientId: string): Promise<{
    client: any;
    invoices: any[];
    payments: any[];
    ledger: any[];
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
  }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const { data: client, error: cErr } = await admin
      .from('corporate_clients')
      .select('*')
      .eq('id', corporateClientId)
      .single();

    if (cErr || !client) {
      throw new Error('Corporate client not found');
    }

    const [invoices, ledger] = await Promise.all([
      this.getInvoices({ clientId: corporateClientId, limit: 100 }),
      this.getLedger(corporateClientId, 100)
    ]);

    const totalInvoiced = invoices.reduce((acc, it) => acc + Number(it.grand_total || 0), 0);
    const totalPaid = invoices.reduce((acc, it) => acc + Number(it.paid_amount || 0), 0);
    const totalOutstanding = Number(client.outstanding_balance || 0);

    return {
      client,
      invoices,
      payments: [],
      ledger,
      totalInvoiced: Number(totalInvoiced.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalOutstanding: Number(totalOutstanding.toFixed(2))
    };
  }
}
