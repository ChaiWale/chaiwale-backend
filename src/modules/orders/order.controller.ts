import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { ApiResponse } from '../../types/common.types';
import { emailService } from '../notifications/email/email.service';
import { buildWhatsAppUrl, DEFAULT_STORE_WHATSAPP, WhatsAppTemplates } from '../notifications/whatsapp/whatsapp-builder';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { config } from '../../config/env.config';
import { OrderRepository } from './order.repository';

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

      // Parse customer name, phone & optional email from body or specialInstructions
      let customerName = (req.body.customerName || '').trim();
      let customerPhone = (req.body.customerPhone || '').trim();
      const customerEmail = (req.body.customerEmail || req.body.email || '').trim();
      if (!customerName || !customerPhone) {
        if (specialInstructions) {
          const nameMatch = specialInstructions.match(/Customer:\s*([^,(]+)/i);
          const phoneMatch = specialInstructions.match(/Phone:\s*([\d\s+\-()]+)/i);
          if (nameMatch && !customerName) customerName = nameMatch[1].trim();
          if (phoneMatch && !customerPhone) customerPhone = phoneMatch[1].trim();
        }
      }
      if (!customerName) customerName = 'Customer';

      // Auto-link or create Customer in Supabase directory
      let resolvedCustomerId = customerId;
      const admin = getSupabaseAdminClient();
      if (!resolvedCustomerId && customerPhone && admin) {
        try {
          const cleanPhone = customerPhone.replace(/\D/g, '');
          if (cleanPhone.length >= 10) {
            const { data: existingCust } = await admin
              .from('customers')
              .select('id')
              .eq('phone', cleanPhone)
              .maybeSingle();

            if (existingCust) {
              resolvedCustomerId = existingCust.id;
              if (deliveryAddress || customerName || customerEmail) {
                const updatePayload: Record<string, any> = {
                  name: customerName,
                  delivery_address: deliveryAddress || undefined
                };
                if (customerEmail) updatePayload.email = customerEmail;
                await admin
                  .from('customers')
                  .update(updatePayload)
                  .eq('id', resolvedCustomerId);
              }
            } else {
              const { data: newCust } = await admin
                .from('customers')
                .insert({
                  name: customerName,
                  phone: cleanPhone,
                  email: customerEmail || null,
                  delivery_address: deliveryAddress || null
                })
                .select('id')
                .single();
              if (newCust) resolvedCustomerId = newCust.id;
            }
          }
        } catch (custErr) {
          console.error('[ORDER CUSTOMER SYNC] Warning: Could not sync customer profile:', custErr);
        }
      }

      const result = await OrderService.placeOrder({
        customerId: resolvedCustomerId,
        orderType: orderType || 'DIRECT_DELIVERY',
        deliveryAddress,
        deliveryDistanceKm: deliveryDistanceKm ? Number(deliveryDistanceKm) : undefined,
        specialInstructions,
        items,
        overallDiscountPercent: overallDiscountPercent ? Number(overallDiscountPercent) : undefined,
        additionalCharges: additionalCharges ? Number(additionalCharges) : undefined
      });

      // Build WhatsApp pre-filled message for customer to send to store
      const itemLines = items.map((it: any) => `• ${it.name || 'Item'} x${it.quantity}`).join('\n');
      const grandTotal = items.reduce((sum: number, it: any) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 1)), 0);
      const waMessage = `Hello Chaiwale! 🙏\n\nNew Order: ${result.orderNumber}\nCustomer: ${customerName}${customerPhone ? `\nPhone: ${customerPhone}` : ''}${deliveryAddress ? `\nAddress: ${deliveryAddress}` : ''}\n\nItems:\n${itemLines}\n\nTotal: ₹${grandTotal}\nPayment: ${req.body.paymentMode || 'CASH'}\n\nPlease confirm this order.`;
      const waResult = buildWhatsAppUrl(DEFAULT_STORE_WHATSAPP, waMessage);

      // 1. Dispatch internal operations alert to chaiwale528@gmail.com
      try {
        await emailService.sendNewOrderInternalAlert({
          orderNumber: result.orderNumber,
          customerName,
          customerPhone: customerPhone || undefined,
          customerEmail: customerEmail || undefined,
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
          paymentStatus: req.body.paymentMode === 'UPI' ? 'PENDING' : 'PENDING'
        });
        console.log(`[ORDER NOTIFY] Internal alert email dispatched to store operations for ${result.orderNumber}`);
      } catch (emailErr: any) {
        console.error(`[ORDER NOTIFY] Internal email failed for ${result.orderNumber}: ${emailErr?.message || emailErr}`);
      }

      // 2. Dispatch customer confirmation email (status: PENDING + Call Restaurant notice) if email provided
      if (customerEmail) {
        try {
          await emailService.sendOrderConfirmation(customerEmail, {
            orderNumber: result.orderNumber,
            customerName,
            orderDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            orderType: orderType || 'DIRECT_DELIVERY',
            orderStatus: 'PENDING',
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
            paymentStatus: req.body.paymentMode === 'UPI' ? 'PENDING' : 'PENDING'
          });
          console.log(`[ORDER NOTIFY] Customer order email dispatched to ${customerEmail} for ${result.orderNumber}`);
        } catch (custEmailErr: any) {
          console.error(`[ORDER NOTIFY] Customer email failed for ${result.orderNumber}: ${custEmailErr?.message || custEmailErr}`);
        }
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

      const cleanStatus = status.toUpperCase().trim();
      await OrderService.updateOrderStatus(id, cleanStatus);

      // Fetch order details for customer multi-channel notification dispatch
      let whatsAppUrl: string | null = null;
      try {
        const order = await OrderRepository.trackOrder(id);
        if (order) {
          const custName = order.customer_name || 'Customer';
          const custPhone = order.customer_phone || undefined;
          const custEmail = order.customer_email || undefined;
          const trackingUrl = `${config.appUrl}/track?order=${encodeURIComponent(order.order_number)}`;
          const googleReviewUrl = 'https://g.page/r/Ca1qOd1BBfkEEBM/review';

          // 1. STAGE 1: ORDER CONFIRMED BY STORE
          if (cleanStatus === 'CONFIRMED') {
            // Customer Email Dispatch
            if (custEmail) {
              try {
                await emailService.sendOrderConfirmation(custEmail, {
                  orderNumber: order.order_number,
                  customerName: custName,
                  orderDate: new Date(order.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                  orderType: order.order_type || 'DIRECT_DELIVERY',
                  orderStatus: 'CONFIRMED',
                  deliveryAddress: order.delivery_address || undefined,
                  specialInstructions: order.special_instructions || undefined,
                  items: (order.items || []).map((it: any) => ({
                    name: it.item_name || 'Item',
                    quantity: Number(it.quantity || 1),
                    unitPrice: Number(it.unit_price || 0),
                    total: Number(it.line_total || 0)
                  })),
                  subtotal: Number(order.subtotal || order.grand_total || 0),
                  grandTotal: Number(order.grand_total || 0),
                  paymentMode: order.payment_mode || 'CASH',
                  paymentStatus: order.payment_status || 'PENDING'
                });
                console.log(`[ORDER NOTIFY] Dispatched CONFIRMED email to ${custEmail} for #${order.order_number}`);
              } catch (emailErr: any) {
                console.error(`[ORDER NOTIFY] Customer email failed on CONFIRMED: ${emailErr?.message || emailErr}`);
              }
            }

            // Customer WhatsApp Message
            if (custPhone) {
              const waText = WhatsAppTemplates.ORDER_CONFIRMATION({
                customerName: custName,
                orderNumber: order.order_number,
                total: order.grand_total,
                paymentMode: order.payment_mode || 'CASH',
                trackingUrl
              });
              const waRes = buildWhatsAppUrl(custPhone, waText);
              if (waRes.success) whatsAppUrl = waRes.url || null;
            }
          }

          // 2. STAGE 2: ORDER DELIVERED / COMPLETED + GOOGLE REVIEW REQUEST
          if (cleanStatus === 'DELIVERED' || cleanStatus === 'COMPLETED') {
            // Customer Email Dispatch with Google Review Link
            if (custEmail) {
              try {
                await emailService.sendOrderDeliveredReview(custEmail, {
                  orderNumber: order.order_number,
                  customerName: custName,
                  grandTotal: Number(order.grand_total || 0),
                  googleReviewUrl,
                  deliveredDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                });
                console.log(`[ORDER NOTIFY] Dispatched DELIVERED & Review email to ${custEmail} for #${order.order_number}`);
              } catch (emailErr: any) {
                console.error(`[ORDER NOTIFY] Customer email failed on DELIVERED: ${emailErr?.message || emailErr}`);
              }
            }

            // Customer WhatsApp Message with Google Review Link
            if (custPhone) {
              const waText = WhatsAppTemplates.ORDER_DELIVERED_REVIEW({
                customerName: custName,
                orderNumber: order.order_number,
                googleReviewUrl
              });
              const waRes = buildWhatsAppUrl(custPhone, waText);
              if (waRes.success) whatsAppUrl = waRes.url || null;
            }
          }
        }
      } catch (notifyErr: any) {
        console.error(`[ORDER NOTIFY] Warning: Post-status dispatch error:`, notifyErr);
      }

      res.json({
        success: true,
        message: `Order status updated to ${cleanStatus} in database`,
        data: {
          status: cleanStatus,
          whatsAppUrl
        },
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
