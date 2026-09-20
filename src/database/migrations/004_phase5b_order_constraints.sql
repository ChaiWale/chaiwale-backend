-- Phase 5B: Update constraints for Order and Invoice state machines

-- 1. Update orders status check constraint to include all valid operational statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('NEW', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'));

-- 2. Update invoices status check constraint to include UNPAID
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('DRAFT', 'ISSUED', 'UNPAID', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'));

-- 3. Update invoices invoice_type check constraint to include RETAIL and CORPORATE aliases
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_type_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_type_check 
    CHECK (invoice_type IN ('DIRECT', 'RETAIL', 'CORPORATE', 'CORPORATE_CREDIT', 'CATERING'));
