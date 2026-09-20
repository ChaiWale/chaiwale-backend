-- ============================================================================
-- 005_client_pin_lookup.sql
-- Adds client_pin column to khata_offices for customer-facing bill lookup
-- ============================================================================

-- Add client_pin column (6-char alphanumeric, unique per office)
ALTER TABLE khata_offices
  ADD COLUMN IF NOT EXISTS client_pin VARCHAR(8) DEFAULT NULL;

-- Create unique index (sparse — only indexed when not null)
CREATE UNIQUE INDEX IF NOT EXISTS khata_offices_client_pin_idx
  ON khata_offices (client_pin)
  WHERE client_pin IS NOT NULL;

-- Helper function: generate a random 6-char uppercase PIN
CREATE OR REPLACE FUNCTION generate_client_pin() RETURNS VARCHAR AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
