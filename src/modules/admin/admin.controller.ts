import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { ApiResponse } from '../../types/common.types';

export class AdminController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Admin module initialized (Live Supabase Persistence Layer)',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Operational Financial & Business Metrics
   * Shows real-time database figures:
   * - orders count & sales
   * - paid amount vs outstanding balance
   * - Cash vs UPI vs Credit breakdown
   * - catering pipeline count
   * - date range filtering
   */
  public static async getDashboardStats(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const admin = getSupabaseAdminClient();
      if (!admin) {
        throw new Error('Supabase admin client not initialized.');
      }

      const today = new Date().toISOString().split('T')[0];
      let dateFrom = (req.query.dateFrom as string) || today;
      let dateTo = (req.query.dateTo as string) || today;

      const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
      if (!DATE_REGEX.test(dateFrom)) dateFrom = today;
      if (!DATE_REGEX.test(dateTo)) dateTo = today;

      const dFrom = new Date(dateFrom);
      const dTo = new Date(dateTo);
      const diffMs = Math.abs(dTo.getTime() - dFrom.getTime());
      const maxMs = 90 * 24 * 60 * 60 * 1000; // 90 days maximum
      if (diffMs > maxMs) {
        const clampedFrom = new Date(dTo.getTime() - maxMs);
        dateFrom = clampedFrom.toISOString().split('T')[0];
      }

      const startIso = `${dateFrom}T00:00:00Z`;
      const endIso = `${dateTo}T23:59:59Z`;

      // 1. Orders within date range
      const { data: ordersData, error: ordersErr } = await admin
        .from('orders')
        .select('id, grand_total, payment_mode, payment_status, created_at')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

      if (ordersErr) {
        throw new Error(`Database error fetching orders stats: ${ordersErr.message}`);
      }

      const orders = ordersData || [];
      const todayOrdersCount = orders.length;
      const totalSales = orders.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);

      let codSales = 0;
      let upiSales = 0;
      let creditSales = 0;

      orders.forEach((o) => {
        const amt = Number(o.grand_total || 0);
        const mode = (o.payment_mode || 'CASH').toUpperCase();
        if (mode === 'CASH') codSales += amt;
        else if (mode === 'UPI') upiSales += amt;
        else if (mode === 'CREDIT') creditSales += amt;
      });

      // 2. Invoices within date range (Paid vs Outstanding)
      const { data: invoicesData, error: invErr } = await admin
        .from('invoices')
        .select('id, invoice_number, grand_total, paid_amount, outstanding_amount, status, issued_at, department')
        .gte('issued_at', startIso)
        .lte('issued_at', endIso)
        .order('issued_at', { ascending: false });

      if (invErr) {
        throw new Error(`Database error fetching invoice metrics: ${invErr.message}`);
      }

      const invoices = invoicesData || [];
      const paidAmount = invoices.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0);
      const outstandingAmount = invoices.reduce((acc, curr) => acc + Number(curr.outstanding_amount || 0), 0);

      // 3. Active Catering Leads count
      const { count: leadsCount, error: leadsErr } = await admin
        .from('catering_enquiries')
        .select('id', { count: 'exact', head: true });

      if (leadsErr) {
        throw new Error(`Database error fetching leads stats: ${leadsErr.message}`);
      }

      // 4. Active Corporate Clients count
      const { count: corporateCount, error: corpErr } = await admin
        .from('corporate_clients')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      if (corpErr) {
        throw new Error(`Database error fetching corporate clients stats: ${corpErr.message}`);
      }

      res.json({
        success: true,
        data: {
          period: { dateFrom, dateTo },
          todayOrders: todayOrdersCount,
          todaySales: Math.round(totalSales),
          paidAmount: Math.round(paidAmount),
          outstandingAmount: Math.round(outstandingAmount),
          breakdown: {
            codAmount: Math.round(codSales),
            upiAmount: Math.round(upiSales),
            creditAmount: Math.round(creditSales)
          },
          cateringLeads: leadsCount || 0,
          activeCorporateClients: corporateCount || 0,
          recentInvoices: invoices.slice(0, 5),
          date: today
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCustomers(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const admin = getSupabaseAdminClient();
      if (!admin) {
        throw new Error('Supabase admin client not initialized.');
      }

      const rawLimit = req.query.limit || req.query.pageSize;
      const parsedLimit = rawLimit ? parseInt(rawLimit as string, 10) : 50;
      const limit = isNaN(parsedLimit) ? 50 : Math.min(Math.max(1, parsedLimit), 100);

      const { data, error } = await admin
        .from('customers')
        .select('id, name, phone, email, created_at, auth_user_id')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Database error fetching customers: ${error.message}`);
      }

      res.json({
        success: true,
        data: data || [],
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
