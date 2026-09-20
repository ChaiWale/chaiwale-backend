const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  const sql = `
    CREATE TABLE IF NOT EXISTS khata_offices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      company_name TEXT,
      floor_unit TEXT,
      notes TEXT,
      client_pin VARCHAR(16),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_khata_offices_phone ON khata_offices(phone);
    CREATE UNIQUE INDEX IF NOT EXISTS khata_offices_client_pin_idx ON khata_offices(client_pin) WHERE client_pin IS NOT NULL;

    CREATE TABLE IF NOT EXISTS khata_entries (
      id TEXT PRIMARY KEY,
      office_id TEXT NOT NULL REFERENCES khata_offices(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      item_name TEXT NOT NULL,
      quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
      unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_khata_entries_office_id ON khata_entries(office_id);
    CREATE INDEX IF NOT EXISTS idx_khata_entries_date ON khata_entries(date);

    CREATE TABLE IF NOT EXISTS khata_payments (
      id TEXT PRIMARY KEY,
      office_id TEXT NOT NULL REFERENCES khata_offices(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      payment_mode TEXT NOT NULL DEFAULT 'CASH',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_khata_payments_office_id ON khata_payments(office_id);

    -- Enable RLS
    ALTER TABLE khata_offices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE khata_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE khata_payments ENABLE ROW LEVEL SECURITY;

    -- Create public read policy or service role bypass
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'khata_offices' AND policyname = 'service_role_all_khata_offices'
      ) THEN
        CREATE POLICY service_role_all_khata_offices ON khata_offices FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'khata_entries' AND policyname = 'service_role_all_khata_entries'
      ) THEN
        CREATE POLICY service_role_all_khata_entries ON khata_entries FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'khata_payments' AND policyname = 'service_role_all_khata_payments'
      ) THEN
        CREATE POLICY service_role_all_khata_payments ON khata_payments FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;
    END
    $$;
  `;

  await client.query(sql);
  console.log('Successfully created khata_offices, khata_entries, and khata_payments tables and policies!');
  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
