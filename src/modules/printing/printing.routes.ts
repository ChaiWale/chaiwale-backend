import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { OrderRepository } from '../orders/order.repository';
import { BillingRepository } from '../billing/billing.repository';
import { ReceiptBuilder } from './receipt.builder';

const router = Router();

/**
 * Generate ESC/POS Raw Bytes & Base64 Payload for Thermal Printers
 */
router.post(
  '/receipt',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receiptType = req.body.receiptType || req.body.type;
      const { orderId, invoiceId } = req.body;

      if (!receiptType) {
        res.status(400).json({ success: false, message: 'receiptType is required (CUSTOMER_BILL | KOT | CREDIT_BILL)' });
        return;
      }

      if (receiptType === 'KOT') {
        const { orderId, invoiceId, items, orderNumber, tableOrAddress } = req.body;

        if (items && Array.isArray(items) && items.length > 0) {
          const payload = ReceiptBuilder.buildKOT({
            orderNumber: orderNumber || 'KOT-POS',
            orderType: 'POS COUNTER',
            date: new Date().toLocaleString('en-IN'),
            tableOrAddress: tableOrAddress || 'Counter Walk-in',
            items: items.map((it: any) => ({
              name: it.item_name || it.name,
              quantity: it.quantity || 1
            }))
          });
          res.json({
            success: true,
            data: {
              ...payload,
              escPosBase64: payload.base64String
            }
          });
          return;
        }

        if (!orderId && !invoiceId) {
          res.status(400).json({ success: false, message: 'orderId, invoiceId, or items array is required for KOT' });
          return;
        }

        let order: any = null;
        if (orderId) {
          order = await OrderRepository.getOrderById(orderId);
        }

        const effectiveInvoiceId = invoiceId || (!order ? orderId : null);
        if (!order && effectiveInvoiceId) {
          const invoice = await BillingRepository.getInvoiceById(effectiveInvoiceId);
          if (invoice) {
            const rawItems = invoice.orders?.order_items || invoice.items || [];
            const payload = ReceiptBuilder.buildKOT({
              orderNumber: invoice.invoice_number,
              orderType: 'POS COUNTER',
              date: new Date(invoice.issued_at || Date.now()).toLocaleString('en-IN'),
              tableOrAddress: invoice.department || 'Counter Walk-in',
              items: rawItems.map((it: any) => ({
                name: it.item_name || it.name,
                quantity: it.quantity
              }))
            });

            res.json({
              success: true,
              data: {
                ...payload,
                escPosBase64: payload.base64String
              }
            });
            return;
          }
        }

        if (!order) {
          res.status(404).json({ success: false, message: `Order or Invoice '${orderId || invoiceId}' not found for KOT` });
          return;
        }

        const payload = ReceiptBuilder.buildKOT({
          orderNumber: order.order_number,
          orderType: order.order_type,
          date: new Date(order.created_at).toLocaleString('en-IN'),
          tableOrAddress: order.delivery_address || order.customer_name,
          items: (order.items || []).map((it: any) => ({
            name: it.item_name,
            quantity: it.quantity
          }))
        });

        res.json({
          success: true,
          data: {
            ...payload,
            escPosBase64: payload.base64String
          }
        });
        return;
      }

      if (receiptType === 'CREDIT_BILL') {
        if (!invoiceId) {
          res.status(400).json({ success: false, message: 'invoiceId is required for CREDIT_BILL' });
          return;
        }

        const invoice = await BillingRepository.getInvoiceById(invoiceId);
        if (!invoice) {
          res.status(404).json({ success: false, message: `Invoice ${invoiceId} not found` });
          return;
        }

        const payload = ReceiptBuilder.buildCreditBill({
          invoiceNumber: invoice.invoice_number,
          date: new Date(invoice.issued_at).toLocaleString('en-IN'),
          companyName: invoice.corporate_clients?.company_name || 'Corporate Account',
          department: invoice.department,
          grandTotal: Number(invoice.grand_total),
          items: (invoice.orders?.order_items || []).map((it: any) => ({
            name: it.item_name,
            quantity: it.quantity,
            total: Number(it.line_total)
          }))
        });

        res.json({ success: true, data: payload });
        return;
      }

      // Default: CUSTOMER_BILL
      let invoiceData = invoiceId ? await BillingRepository.getInvoiceById(invoiceId) : null;
      let orderData = orderId ? await OrderRepository.getOrderById(orderId) : null;

      if (!invoiceData && !orderData) {
        res.status(400).json({ success: false, message: 'Either invoiceId or orderId is required' });
        return;
      }

      const { StoreProfileService } = await import('../../services/store-profile.service');
      const storeProfile = await StoreProfileService.getProfile();

      const payload = ReceiptBuilder.buildCustomerBill({
        storeName: storeProfile.store_name,
        storeAddress: storeProfile.address,
        invoiceNumber: invoiceData?.invoice_number || `REC-${orderData?.order_number}`,
        orderNumber: orderData?.order_number,
        date: new Date(invoiceData?.issued_at || orderData?.created_at || Date.now()).toLocaleString('en-IN'),
        customerName: invoiceData?.orders?.customer_name || orderData?.customer_name,
        subtotal: Number(invoiceData?.subtotal || orderData?.subtotal || 0),
        tax: Number(invoiceData?.tax_amount || orderData?.tax_amount || 0),
        discount: Number(invoiceData?.discount_amount || orderData?.discount_amount || 0),
        grandTotal: Number(invoiceData?.grand_total || orderData?.grand_total || 0),
        paymentMode: orderData?.payment_mode || invoiceData?.orders?.payment_mode || 'CASH',
        paymentStatus: invoiceData?.status || orderData?.payment_status || 'PAID',
        items: (invoiceData?.orders?.order_items || orderData?.items || []).map((it: any) => ({
          name: it.item_name,
          quantity: it.quantity,
          total: Number(it.line_total || it.unit_price * it.quantity)
        }))
      });


      res.json({
        success: true,
        data: {
          ...payload,
          escPosBase64: payload.base64String
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

export const printingRoutes = router;
