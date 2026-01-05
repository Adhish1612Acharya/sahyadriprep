import { TABLES } from "@/constants";
import { CollegeAdminProfile } from "@/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchCollegeAdminByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: CollegeAdminProfile | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.collegeAdminProfiles)
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}
