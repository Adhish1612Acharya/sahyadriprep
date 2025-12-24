import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchProfileByUserId } from "@/lib/repositories/profiles/fetch";
import { fetchCollegeAdminByUserId } from "@/lib/repositories/admin";

export async function getAdminCollegeId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const admin = await fetchCollegeAdminByUserId(supabase, userId);
  if (!admin) return null;

  const profile = await fetchProfileByUserId(supabase, userId);
  if (profile?.role !== "college_admin" && profile?.role !== "super_admin") {
    return null;
  }

  return admin.college_id;
}
