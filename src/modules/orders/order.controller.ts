import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { ApiResponse } from '../../types/common.types';

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

      res.status(201).json({
        success: true,
        message: 'Order placed successfully and recorded in database',
        data: result,
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
}
