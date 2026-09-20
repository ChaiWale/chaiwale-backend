import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';

/**
 * Migration Runner Utility
 * Executes version-controlled SQL migrations directly against Supabase PostgreSQL
 * using the configured DATABASE_URL.
 */
export async function runMigrations(): Promise<{ success: boolean; executed: string[] }> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured in backend/.env');
  }

  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = ['001_initial_schema.sql', '002_seed_menu_data.sql', '003_phase5b_business_operations.sql'];

  console.log(`[MIGRATIONS] Connecting to Supabase PostgreSQL database...`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log(`[MIGRATIONS] Connected successfully to database.`);

  const executed: string[] = [];

  try {
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${filePath}`);
      }

      console.log(`[MIGRATIONS] Executing ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Execute in transaction
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      executed.push(file);
      console.log(`[MIGRATIONS] Successfully executed ${file}`);
    }

    return { success: true, executed };
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`[MIGRATIONS] Error executing migrations: ${err.message}`);
    throw err;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then((res) => {
      console.log(`[MIGRATIONS] All ${res.executed.length} migrations completed successfully.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MIGRATIONS] Migration execution failed:', err.message);
      process.exit(1);
    });
}
