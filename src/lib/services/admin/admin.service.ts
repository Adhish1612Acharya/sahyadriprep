import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAdminCollegeByUserId } from "@/lib/repositories/admin/admin.repository";
import { fetchProfileByUserId } from "@/lib/repositories/profile/profile.repository";

export async function getAdminCollegeId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const admin = await fetchAdminCollegeByUserId(supabase, userId);
  if (!admin) return null;

  const profile = await fetchProfileByUserId(supabase, userId);
  if (profile?.role !== "college_admin" && profile?.role !== "super_admin") {
    return null;
  }

  return admin.collegeId;
}
