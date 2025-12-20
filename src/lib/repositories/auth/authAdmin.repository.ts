import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRole } from './auth.repository.types';

export async function adminDeleteAuthUser(userId: string) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

export async function adminCreateAuthUser(params: {
  email: string;
  password: string;
  role: UserRole;
  college_id?: string | null;
}) {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    user_metadata: {
      role: params.role,
      college_id: params.college_id ?? null,
    },
    email_confirm: true,
  });

  if (error || !data.user) throw error ?? new Error('Failed to create user');
  return data.user;
}

export async function adminUpdateUserMetadata(
  userId: string,
  metadata: Record<string, any>,
) {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: metadata },
  );
  if (error) throw error;
  return data.user;
}
