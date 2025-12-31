import { CollegeAdminProfile } from "@/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchCollegeAdminByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: CollegeAdminProfile | null; error: any }> {
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}
