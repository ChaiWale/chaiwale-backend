import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.config';

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Public Supabase Client (Anonymous key)
 * Used for public read queries under Row Level Security.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!config.supabase.url || !config.supabase.anonKey) {
    return null;
  }
  if (!publicClient) {
    publicClient = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: { persistSession: false }
    });
  }
  return publicClient;
};

/**
 * Privileged Supabase Admin Client (Service Role Key)
 * Strictly server-side; NEVER exposed to client-side browsers.
 * Used by backend controllers/services to execute verified business logic,
 * order insertions, invoice generations, and ledger updates.
 */
export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    return null;
  }
  if (!adminClient) {
    adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false }
    });
  }
  return adminClient;
};

/**
 * Check if Supabase connection credentials are configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.supabase.url && (config.supabase.anonKey || config.supabase.serviceRoleKey));
};
