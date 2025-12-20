import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCurrentUser, getUserRole } from './auth-session.service';

export async function requireAuth(supabase: SupabaseClient) {
  const user = await getCurrentUser(supabase);
  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to perform this action',
        },
        { status: 401 },
      ),
      user: null,
    };
  }
  return { error: null, user };
}

export async function requireAdmin(supabase: SupabaseClient) {
  const { error, user } = await requireAuth(supabase);
  if (error) return { error, user: null, role: null };

  const role = await getUserRole(supabase, user!.id);
  if (!role || (role !== 'college_admin' && role !== 'super_admin')) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message:
            'Only college admins and super admins can perform this action',
        },
        { status: 403 },
      ),
      user: null,
      role: null,
    };
  }
  return { error: null, user, role };
}

export async function requireSuperAdmin(supabase: SupabaseClient) {
  const { error, user } = await requireAuth(supabase);
  if (error) return { error, user: null, role: null };

  const role = await getUserRole(supabase, user!.id);
  if (role !== 'super_admin') {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Only super admins can perform this action',
        },
        { status: 403 },
      ),
      user: null,
      role: null,
    };
  }
  return { error: null, user, role };
}
