import { TABLES } from "@/constants/tables.constants";
import { CollegeAdminProfile } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateCollegeAdminProfileRepository(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, any>
): Promise<{ data: CollegeAdminProfile | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.collegeAdminProfiles)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}
