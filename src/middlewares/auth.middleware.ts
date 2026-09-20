import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient } from '../config/supabase.config';
import { UserRole, AuthenticatedUser } from '../types/auth.types';
import { ApiResponse } from '../types/common.types';

/**
 * Middleware: Verify Supabase Auth JWT Token
 * Enforces server-side token verification via Supabase Admin API.
 * Never decodes JWT manually or trusts client-supplied user IDs.
 */
export const requireAuth = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]?.trim() || '';
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token.trim();
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Bearer token.',
        error: { code: 'UNAUTHORIZED' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      res.status(500).json({
        success: false,
        message: 'Internal server configuration error.',
        error: { code: 'INTERNAL_ERROR' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 1. Authoritative verification via Supabase Auth
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        message: 'Invalid, expired, or revoked authentication token.',
        error: { code: 'UNAUTHORIZED' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = authData.user;

    // 2. Resolve Role from profiles (Staff / Manager / Admin)
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, role, full_name, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      res.status(500).json({
        success: false,
        message: 'Database error resolving application profile.',
        error: { code: 'INTERNAL_ERROR' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (profile) {
      if (!profile.is_active) {
        res.status(403).json({
          success: false,
          message: 'Account is deactivated. Access denied.',
          error: { code: 'FORBIDDEN_INACTIVE' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email || '',
        role: profile.role as UserRole,
        fullName: profile.full_name,
        isActive: profile.is_active
      };
      next();
      return;
    }

    // 3. Fallback: Check customers directory
    const { data: customer } = await admin
      .from('customers')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (customer) {
      req.user = {
        id: user.id,
        email: user.email || '',
        role: 'customer',
        fullName: customer.name,
        isActive: true
      };
      next();
      return;
    }

    // 4. Authenticated identity with no application role record -> Controlled 403
    res.status(403).json({
      success: false,
      message: 'Access denied. No authorized application profile found for this user identity.',
      error: { code: 'FORBIDDEN_NO_PROFILE' },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Unexpected authentication error.',
      error: { code: 'AUTH_ERROR' },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware: Enforce Role-Based Authorization
 * Reusable role checker: requireRole(['admin']), requireRole(['admin', 'manager']), etc.
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: { code: 'UNAUTHORIZED' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!req.user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
        error: { code: 'FORBIDDEN_INACTIVE' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        error: { code: 'FORBIDDEN_INSUFFICIENT_ROLE' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};
