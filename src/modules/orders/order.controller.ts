import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { ApiResponse } from '../../types/common.types';
import { emailService } from '../notifications/email/email.service';
import { buildWhatsAppUrl, DEFAULT_STORE_WHATSAPP } from '../notifications/whatsapp/whatsapp-builder';

export class OrderController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Orders module initialized (Live Supabase Persistence Layer)',
      timestamp: new Date().toISOString()
    });
  }

  public static async createOrder(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const {
        customerId,
        orderType,
        deliveryAddress,
        deliveryDistanceKm,
        specialInstructions,
        items,
        overallDiscountPercent,
        additionalCharges
      } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one item is required to place an order',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await OrderService.placeOrder({
        customerId,
        orderType: orderType || 'DIRECT_DELIVERY',
        deliveryAddress,
        deliveryDistanceKm: deliveryDistanceKm ? Number(deliveryDistanceKm) : undefined,
        specialInstructions,
        items,
        overallDiscountPercent: overallDiscountPercent ? Number(overallDiscountPercent) : undefined,
        additionalCharges: additionalCharges ? Number(additionalCharges) : undefined
      });

      // Parse customer name & phone from specialInstructions (set by frontend checkout form)
      let customerName = 'Customer';
      let customerPhone = '';
      if (specialInstructions) {
        const nameMatch = specialInstructions.match(/Customer:\s*([^,(]+)/i);
        const phoneMatch = specialInstructions.match(/Phone:\s*([\d\s+\-()]+)/i);
        if (nameMatch) customerName = nameMatch[1].trim();
        if (phoneMatch) customerPhone = phoneMatch[1].trim();
      }

      // Build WhatsApp pre-filled message for customer to send to store
      const itemLines = items.map((it: any) => `• ${it.name || 'Item'} x${it.quantity}`).join('\n');
      const grandTotal = items.reduce((sum: number, it: any) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 1)), 0);
      const waMessage = `Hello Chaiwale! 🙏\n\nNew Order: ${result.orderNumber}\nCustomer: ${customerName}${customerPhone ? `\nPhone: ${customerPhone}` : ''}${deliveryAddress ? `\nAddress: ${deliveryAddress}` : ''}\n\nItems:\n${itemLines}\n\nTotal: ₹${grandTotal}\nPayment: ${req.body.paymentMode || 'CASH'}\n\nPlease confirm this order.`;
      const waResult = buildWhatsAppUrl(DEFAULT_STORE_WHATSAPP, waMessage);

      // Send internal email notification to chaiwale528@gmail.com
      try {
        await emailService.sendOrderConfirmation('chaiwale528@gmail.com', {
          orderNumber: result.orderNumber,
          customerName,
          orderDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          orderType: orderType || 'DIRECT_DELIVERY',
          deliveryAddress: deliveryAddress || undefined,
          specialInstructions: specialInstructions || undefined,
          items: items.map((it: any) => ({
            name: it.name || 'Menu Item',
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            total: Number(it.unitPrice || 0) * Number(it.quantity || 1)
          })),
          subtotal: grandTotal,
          grandTotal,
          paymentMode: req.body.paymentMode || 'CASH',
          paymentStatus: 'PENDING'
        });
        console.log(`[ORDER NOTIFY] Email dispatched to chaiwale528@gmail.com for ${result.orderNumber}`);
      } catch (emailErr: any) {
        console.error(`[ORDER NOTIFY] Email failed for ${result.orderNumber}: ${emailErr?.message || emailErr}`);
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully and recorded in database',
        data: {
          ...result,
          whatsAppUrl: waResult.success ? waResult.url : null
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async trackOrder(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      if (!orderNumber || !orderNumber.trim()) {
        res.status(400).json({
          success: false,
          message: 'Order number is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const order = await OrderService.trackOrder(orderNumber.trim());
      if (!order) {
        res.status(404).json({
          success: false,
          message: `Order '${orderNumber}' not found. Please verify the order number.`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: order,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getRecentOrders(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rawLimit = req.query.limit || req.query.pageSize;
      const parsedLimit = rawLimit ? parseInt(rawLimit as string, 10) : 15;
      const limit = isNaN(parsedLimit) ? 15 : Math.min(Math.max(1, parsedLimit), 50);
      const orders = await OrderService.getRecentOrders(limit);
      res.json({
        success: true,
        data: orders,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateOrderStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await OrderService.updateOrderStatus(id, status);
      res.json({
        success: true,
        message: `Order status updated to ${status.toUpperCase()} in database`,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      if (err.message && err.message.includes('Invalid status transition')) {
        res.status(400).json({
          success: false,
          message: err.message,
          timestamp: new Date().toISOString()
        });
        return;
      }
      next(err);
    }
  }

  public static async verifyPayment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await OrderService.verifyPayment(id);
      res.json({
        success: true,
        message: `Payment for order '${id}' successfully verified and marked PAID`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteOrder(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await OrderService.deleteOrder(id);
      res.json({
        success: true,
        message: `Order '${id}' permanently deleted`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
