-- ============================================================================
-- CHAIWALE PLATFORM: 003_phase5b_business_operations.sql
-- Phase 5B: Business Operations, Billing, Payments, Ledger & Document Storage
-- ============================================================================

-- 1. ENHANCE INVOICES WITH ATOMIC OUTSTANDING TRACKING & DEPARTMENT
ALTER TABLE invoices 
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outstanding_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS department TEXT;

-- Synchronize existing invoices
UPDATE invoices
SET 
  paid_amount = CASE WHEN status = 'PAID' THEN grand_total ELSE 0 END,
  outstanding_amount = CASE WHEN status = 'PAID' THEN 0 ELSE grand_total END
WHERE paid_amount = 0 AND outstanding_amount = 0;

-- 2. ENHANCE ORDERS WITH PAYMENT MODE & UTR / TRANSACTION REF
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payment_mode TEXT CHECK (payment_mode IN ('CASH', 'UPI', 'CREDIT')),
  ADD COLUMN IF NOT EXISTS transaction_ref TEXT;

-- 3. EXPAND CATERING PIPELINE STATUSES
ALTER TABLE catering_enquiries 
  DROP CONSTRAINT IF EXISTS catering_enquiries_status_check;

ALTER TABLE catering_enquiries 
  ADD CONSTRAINT catering_enquiries_status_check 
  CHECK (status IN (
    'NEW', 
    'CONTACTED', 
    'REQUIREMENT_CONFIRMED', 
    'QUOTE_SENT', 
    'NEGOTIATION', 
    'ADVANCE_RECEIVED', 
    'CONFIRMED', 
    'COMPLETED', 
    'LOST'
  ));

-- 4. DOCUMENT STORAGE REFERENCE TABLE (NO BINARY IN POSTGRESQL)
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'CUSTOMER_INVOICE', 
    'CORPORATE_INVOICE', 
    'PAYMENT_RECEIPT', 
    'OUTSTANDING_STATEMENT', 
    'LEDGER_STATEMENT',
    'ATTENDANCE_REPORT'
  )),
  reference_id UUID,
  reference_number TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_docs_ref ON generated_documents(reference_number);
CREATE INDEX IF NOT EXISTS idx_generated_docs_type ON generated_documents(doc_type);

-- 5. SEED / UPDATE OFFICIAL CHAIWALE UPI CONFIGURATION
INSERT INTO app_settings (key, value_json, description)
VALUES (
  'brand_upi_config',
  '{"upi_id": "chaiwale@ptyes", "merchant_name": "Chaiwale", "account_holder": "Shubham Sharma", "qr_storage_path": "branding/chaiwale-upi-qr.jpeg"}'::jsonb,
  'Official Chaiwale Paytm UPI QR and Account Reference'
)
ON CONFLICT (key) DO UPDATE 
SET value_json = EXCLUDED.value_json,
    updated_at = NOW();
