import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fetchCollegeAdminProfile,
  fetchCollegeById,
} from '@/lib/repositories/auth/auth.repository';
import { getUserRole } from './auth-session.service';
import { NextResponse } from 'next/server';

export async function hasCollegeAccess(
  supabase: SupabaseClient,
  userId: string,
  collegeId: string,
): Promise<boolean> {
  const role = await getUserRole(supabase, userId);

  if (role === 'super_admin') return true;

  if (role === 'college_admin') {
    const adminProfile = await fetchCollegeAdminProfile(supabase, userId);
    return adminProfile?.college_id === collegeId;
  }

  return false;
}

export async function getCollegeEmailDomain(
  supabase: SupabaseClient,
  collegeId: string | null,
) {
  if (!collegeId) return 'sahyadri.edu.in';

  const college = await fetchCollegeById(supabase, collegeId);
  return college?.email_domain || 'sahyadri.edu.in';
}

export async function isEmailAllowedForCollege(
  supabase: SupabaseClient,
  email: string,
  collegeId: string | null,
) {
  const allowedDomain = await getCollegeEmailDomain(supabase, collegeId);
  const normalized = (email || '').toLowerCase().trim();
  return normalized.endsWith('@' + allowedDomain.toLowerCase());
}

export async function enforceCollegeEmailOrReject(
  supabase: SupabaseClient,
  email: string,
  collegeId: string | null,
) {
  const ok = await isEmailAllowedForCollege(supabase, email, collegeId);
  if (!ok) {
    return NextResponse.json(
      {
        success: false,
        error: 'InvalidEmailDomain',
        message: 'Please sign up with your college email',
      },
      { status: 403 },
    );
  }
  return null;
}
