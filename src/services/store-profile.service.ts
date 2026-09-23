import { getSupabaseAdminClient } from '../config/supabase.config';
import { BUSINESS_CONFIG } from '../config/business.config';

export interface StoreProfile {
  store_name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  upi_id: string;
  opening_time?: string;
  closing_time?: string;
}

const DEFAULT_PROFILE: StoreProfile = {
  store_name: BUSINESS_CONFIG.brandName,
  tagline: 'Taste of Desi Swag • Cafe & Refreshments',
  address: 'G-31, Vardhman Grand Plaza, Mangalam Place, M2K Road, Rohini Sector-3, New Delhi – 110085',
  phone: BUSINESS_CONFIG.contact.phone,
  whatsapp: BUSINESS_CONFIG.contact.whatsapp,
  email: BUSINESS_CONFIG.contact.supportEmail,
  upi_id: 'chaiwale@ptyes',
  opening_time: '08:00 AM',
  closing_time: '06:00 PM'
};

let cachedProfile: StoreProfile | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 30000; // 30 sec cache for high-throughput printing/PDFs

export class StoreProfileService {
  public static async getProfile(forceRefresh = false): Promise<StoreProfile> {
    const now = Date.now();
    if (!forceRefresh && cachedProfile && now - lastFetchedAt < CACHE_TTL_MS) {
      return cachedProfile;
    }

    try {
      const admin = getSupabaseAdminClient();
      if (!admin) return DEFAULT_PROFILE;

      const { data } = await admin
        .from('app_settings')
        .select('value_json')
        .eq('key', 'store_profile')
        .maybeSingle();

      if (data?.value_json) {
        const resolved: StoreProfile = { ...DEFAULT_PROFILE, ...data.value_json };
        cachedProfile = resolved;
        lastFetchedAt = now;
        return resolved;
      }
    } catch (err) {
      console.warn('[StoreProfileService] Error reading store_profile from DB, using defaults:', err);
    }

    return DEFAULT_PROFILE;


  }

  public static async updateProfile(profile: Partial<StoreProfile>): Promise<StoreProfile> {
    const admin = getSupabaseAdminClient();
    if (!admin) throw new Error('Database client not available');

    const current = await this.getProfile(true);
    const updated: StoreProfile = {
      ...current,
      ...profile
    };

    const { error } = await admin
      .from('app_settings')
      .upsert({
        key: 'store_profile',
        value_json: updated,
        description: 'Central Chaiwale Store Profile & Contact Details',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      throw new Error(`Failed to update store_profile: ${error.message}`);
    }

    cachedProfile = updated;
    lastFetchedAt = Date.now();
    return updated;
  }
}
