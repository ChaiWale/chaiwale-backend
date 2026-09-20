import { getSupabaseAdminClient, getSupabaseClient } from '../../config/supabase.config';
import { UserRole } from '../../types/auth.types';

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  };
}

export class AuthService {
  /**
   * Authenticate user against Supabase Auth and resolve application role
   */
  public static async login(email: string, pass: string): Promise<LoginResult> {
    const publicClient = getSupabaseClient() || getSupabaseAdminClient();
    const admin = getSupabaseAdminClient();

    if (!publicClient || !admin) {
      throw new Error('Supabase client not initialized.');
    }

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await publicClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass
    });

    if (authError || !authData.user || !authData.session) {
      throw new Error('Invalid email or password.');
    }

    const authUser = authData.user;

    // 2. Fetch role from profiles table
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, role, full_name, is_active')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      throw new Error('Database error resolving application profile.');
    }

    if (!profile) {
      // Check customer fallback
      const { data: customer } = await admin
        .from('customers')
        .select('id, name')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (customer) {
        return {
          accessToken: authData.session.access_token,
          user: {
            id: authUser.id,
            email: authUser.email || '',
            role: 'customer',
            fullName: customer.name
          }
        };
      }

      throw new Error('User has no authorized application role assigned.');
    }

    if (!profile.is_active) {
      throw new Error('Account has been deactivated. Please contact an administrator.');
    }

    return {
      accessToken: authData.session.access_token,
      user: {
        id: authUser.id,
        email: authUser.email || '',
        role: profile.role as UserRole,
        fullName: profile.full_name
      }
    };
  }

  /**
   * Fetch current profile for an authenticated user
   */
  public static async getCurrentProfile(userId: string) {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase client not initialized.');
    }

    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching profile: ${error.message}`);
    }

    return profile;
  }
}
