import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileByUserId } from "@/lib/repositories/profiles";
import { UserRole } from "@/types/common.types";

export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getCurrentUserForLayout() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const profile = await fetchProfileByUserId(supabase, userId);
  return profile?.role ?? null;
}

export async function isUserAdmin(supabase: SupabaseClient, userId: string) {
  const role = await getUserRole(supabase, userId);
  return role === "college_admin" || role === "super_admin";
}

export async function isUserSuperAdmin(
  supabase: SupabaseClient,
  userId: string
) {
  const role = await getUserRole(supabase, userId);
  return role === "super_admin";
}
