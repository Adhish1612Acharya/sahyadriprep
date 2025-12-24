import { CollegeAdminProfile } from "@/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchCollegeAdminByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<CollegeAdminProfile | null> {
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return data as CollegeAdminProfile;
}
