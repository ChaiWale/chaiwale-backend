import { getSupabaseAdminClient } from '../../config/supabase.config';

export interface CreateOrderItemInput {
  menuItemId?: string;
  variantId?: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderInput {
  customerId?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DIRECT_DELIVERY' | 'PORTER';
  deliveryAddress?: string;
  deliveryDistanceKm?: number;
  specialInstructions?: string;
  paymentMode?: 'CASH' | 'UPI' | 'CREDIT';
  transactionRef?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  additionalCharges?: number;
  grandTotal: number;
  items: CreateOrderItemInput[];
}

export interface OrderRecord {
  id: string;
  order_number: string;
  order_type: string;
  customer_name?: string;
  delivery_address?: string;
  payment_mode?: string;
  transaction_ref?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  additional_charges?: number;
  grand_total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items?: Array<{
    id?: string;
    item_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class OrderRepository {
  /**
   * Insert new order and immutable order items snapshot directly into Supabase PostgreSQL
   */
  public static async createOrder(input: CreateOrderInput): Promise<{ id: string; orderNumber: string }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const orderNumber = `CW-${Date.now().toString().slice(-6)}`;

    // 1. Insert order record
    const { data: orderData, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: input.customerId || null,
        order_type: input.orderType,
        delivery_address: input.deliveryAddress || null,
        delivery_distance_km: input.deliveryDistanceKm || null,
        special_instructions: input.specialInstructions || null,
        payment_mode: input.paymentMode || 'CASH',
        transaction_ref: input.transactionRef || null,
        subtotal: input.subtotal,
        tax_amount: input.taxAmount,
        discount_amount: input.discountAmount,
        additional_charges: input.additionalCharges || 0,
        grand_total: input.grandTotal,
        status: 'PENDING',
        payment_status: 'PENDING'
      })
      .select('id, order_number')
      .single();

    if (orderError || !orderData) {
      throw new Error(`Database error creating order: ${orderError?.message || 'Unknown insertion error'}`);
    }

    // 2. Insert immutable order items snapshot
    if (input.items && input.items.length > 0) {
      const itemsToInsert = input.items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId || null,
        variant_id: item.variantId || null,
        item_name: item.itemName,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal
      }));

      const { error: itemsError } = await admin.from('order_items').insert(itemsToInsert);
      if (itemsError) {
        console.error(`Warning: Order created (${orderData.order_number}) but items insertion failed: ${itemsError.message}`);
      }
    }

    return { id: orderData.id, orderNumber: orderData.order_number };
  }

  /**
   * Track order by order number or ID
   */
  public static async trackOrder(orderNumber: string): Promise<OrderRecord | null> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const cleanNumber = orderNumber.trim().toUpperCase();
    const isUuid = UUID_REGEX.test(cleanNumber);

    let query = admin
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        delivery_address,
        payment_mode,
        transaction_ref,
        subtotal,
        tax_amount,
        discount_amount,
        additional_charges,
        grand_total,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          item_name,
          unit_price,
          quantity,
          line_total
        )
      `);

    if (isUuid) {
      query = query.or(`id.eq.${cleanNumber},order_number.eq.${cleanNumber}`);
    } else {
      query = query.eq('order_number', cleanNumber);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Database error tracking order '${orderNumber}': ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      order_number: data.order_number,
      order_type: data.order_type,
      delivery_address: data.delivery_address,
      payment_mode: data.payment_mode,
      transaction_ref: data.transaction_ref,
      subtotal: Number(data.subtotal),
      tax_amount: Number(data.tax_amount),
      discount_amount: Number(data.discount_amount),
      additional_charges: Number(data.additional_charges || 0),
      grand_total: Number(data.grand_total),
      status: data.status,
      payment_status: data.payment_status,
      created_at: data.created_at,
      items: data.order_items || []
    };
  }

  /**
   * Fetch recent orders
   */
  public static async getRecentOrders(limit = 15): Promise<OrderRecord[]> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const { data, error } = await admin
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        delivery_address,
        payment_mode,
        transaction_ref,
        subtotal,
        tax_amount,
        discount_amount,
        additional_charges,
        grand_total,
        status,
        payment_status,
        created_at,
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
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Database error fetching recent orders: ${error.message}`);
    }

    return (data || []).map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      order_type: o.order_type,
      customer_name: o.customers?.name || (o.order_type === 'DINE_IN' ? 'Walk-in Table' : 'Direct Customer'),
      delivery_address: o.delivery_address,
      payment_mode: o.payment_mode,
      transaction_ref: o.transaction_ref,
      subtotal: Number(o.subtotal),
      tax_amount: Number(o.tax_amount),
      discount_amount: Number(o.discount_amount),
      additional_charges: Number(o.additional_charges || 0),
      grand_total: Number(o.grand_total),
      status: o.status,
      payment_status: o.payment_status,
      created_at: o.created_at,
      items: o.order_items || []
    }));
  }

  /**
   * Fetch single order by ID with line items
   */
  public static async getOrderById(orderId: string): Promise<OrderRecord | null> {
    return this.trackOrder(orderId);
  }

  /**
   * Update order status in Supabase
   */
  public static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const isUuid = UUID_REGEX.test(orderId.trim());
    let query = admin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() });

    if (isUuid) {
      query = query.or(`id.eq.${orderId.trim()},order_number.eq.${orderId.trim()}`);
    } else {
      query = query.eq('order_number', orderId.trim());
    }

    const { error } = await query;
    if (error) {
      throw new Error(`Database error updating status for order ${orderId}: ${error.message}`);
    }

    return true;
  }

  /**
   * Verify UPI / Direct payment
   */
  public static async verifyPayment(orderId: string): Promise<boolean> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const isUuid = UUID_REGEX.test(orderId.trim());
    let query = admin
      .from('orders')
      .update({ payment_status: 'PAID', updated_at: new Date().toISOString() });

    if (isUuid) {
      query = query.or(`id.eq.${orderId.trim()},order_number.eq.${orderId.trim()}`);
    } else {
      query = query.eq('order_number', orderId.trim());
    }

    const { error } = await query;
    if (error) {
      throw new Error(`Database error verifying payment for order ${orderId}: ${error.message}`);
    }

    return true;
  }
}
