import { OrderRepository, CreateOrderItemInput, OrderRecord } from './order.repository';
import { BillingService } from '../billing/billing.service';
import { getSupabaseAdminClient } from '../../config/supabase.config';

export interface PlaceOrderInput {
  customerId?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DIRECT_DELIVERY' | 'PORTER' | string;
  deliveryAddress?: string;
  deliveryDistanceKm?: number;
  specialInstructions?: string;
  paymentMode?: 'CASH' | 'UPI' | 'CREDIT';
  transactionRef?: string;
  items: Array<{
    productId?: string;
    menuItemId?: string;
    variantId?: string;
    name?: string;
    unitPrice?: number;
    quantity: number;
  }>;
  overallDiscountPercent?: number;
  additionalCharges?: number;
}

function normalizeOrderType(type?: string): 'DINE_IN' | 'TAKEAWAY' | 'DIRECT_DELIVERY' | 'PORTER' {
  if (!type) return 'DIRECT_DELIVERY';
  const u = type.toUpperCase().replace(/\s+/g, '_');
  if (u === 'DELIVERY' || u === 'DIRECT_DELIVERY') return 'DIRECT_DELIVERY';
  if (u === 'TAKEAWAY' || u === 'PICKUP') return 'TAKEAWAY';
  if (u === 'DINE_IN' || u === 'DINEIN') return 'DINE_IN';
  if (u === 'PORTER') return 'PORTER';
  return 'DIRECT_DELIVERY';
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
  PENDING: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'COMPLETED', 'CANCELLED'],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: []
};

export class OrderService {
  /**
   * Place Order with Server-Side Authoritative Billing Calculation
   * Browser-submitted prices/totals are NEVER trusted.
   * BillingService computes line totals, taxes, discounts, and round-offs.
   */
  public static async placeOrder(input: PlaceOrderInput): Promise<{ id: string; orderNumber: string }> {
    const admin = getSupabaseAdminClient();
    const itemIds = input.items
      .map((it) => it.productId || it.menuItemId)
      .filter((id): id is string => Boolean(id));

    // Fetch authoritative menu items from Supabase if needed
    const menuItemsMap: Record<string, { name: string; base_price: number }> = {};
    if (admin && itemIds.length > 0) {
      const { data } = await admin
        .from('menu_items')
        .select('id, name, base_price')
        .in('id', itemIds);
      if (data) {
        data.forEach((m) => {
          menuItemsMap[m.id] = { name: m.name, base_price: Number(m.base_price) };
        });
      }
    }

    // Resolve items with authoritative pricing
    const resolvedItems = input.items.map((it) => {
      const id = it.productId || it.menuItemId || 'custom';
      const dbItem = menuItemsMap[id];
      const name = it.name || dbItem?.name || 'Menu Item';
      const unitPrice = dbItem ? dbItem.base_price : (it.unitPrice !== undefined ? Number(it.unitPrice) : 0);
      const quantity = Math.max(1, Number(it.quantity || 1));

      return {
        productId: id,
        name,
        unitPrice,
        quantity
      };
    });

    // 1. Authoritative calculation via central billing engine
    const billingResult = BillingService.calculateBillTotals({
      items: resolvedItems,
      overallDiscountPercent: input.overallDiscountPercent || 0,
      additionalCharges: input.additionalCharges || 0,
      billType: 'DIRECT'
    });

    // 2. Prepare immutable snapshot line items
    const orderItemsSnapshot: CreateOrderItemInput[] = billingResult.items.map((it) => ({
      menuItemId: it.productId !== 'custom' ? it.productId : undefined,
      itemName: it.name,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: it.lineTotal
    }));

    // 3. Persist order with verified financial totals in Supabase
    return OrderRepository.createOrder({
      customerId: input.customerId,
      orderType: normalizeOrderType(input.orderType),
      deliveryAddress: input.deliveryAddress,
      deliveryDistanceKm: input.deliveryDistanceKm,
      specialInstructions: input.specialInstructions,
      paymentMode: input.paymentMode || 'CASH',
      transactionRef: input.transactionRef,
      subtotal: billingResult.subtotal,
      taxAmount: billingResult.totalTax,
      discountAmount: billingResult.totalDiscount,
      additionalCharges: billingResult.additionalCharges,
      grandTotal: billingResult.roundedTotal,
      items: orderItemsSnapshot
    });
  }

  public static async trackOrder(orderNumber: string): Promise<OrderRecord | null> {
    return OrderRepository.trackOrder(orderNumber);
  }

  public static async getRecentOrders(limit = 15): Promise<OrderRecord[]> {
    return OrderRepository.getRecentOrders(limit);
  }

  public static async getOrderById(orderId: string): Promise<OrderRecord | null> {
    return OrderRepository.getOrderById(orderId);
  }

  /**
   * Update order status with strict state-machine transition checks
   */
  public static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const cleanStatus = status.toUpperCase().trim();
    const validStatuses = ['NEW', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    
    if (!validStatuses.includes(cleanStatus)) {
      throw new Error(`Invalid order status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Fetch existing order to check current status
    const existing = await OrderRepository.trackOrder(orderId);
    if (!existing) {
      throw new Error(`Order ${orderId} not found`);
    }

    const currentStatus = existing.status.toUpperCase();
    if (currentStatus === cleanStatus) {
      return true; // No-op idempotent
    }

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(cleanStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${cleanStatus}'. Allowed transitions: ${allowed.length ? allowed.join(', ') : 'None (Terminal state)'}`
      );
    }

    return OrderRepository.updateOrderStatus(orderId, cleanStatus);
  }

  /**
   * Verify UPI / Direct payment
   */
  public static async verifyPayment(orderId: string): Promise<boolean> {
    const existing = await OrderRepository.trackOrder(orderId);
    if (!existing) {
      throw new Error(`Order ${orderId} not found`);
    }
    return OrderRepository.verifyPayment(orderId);
  }
}
