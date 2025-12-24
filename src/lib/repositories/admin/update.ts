import { CollegeAdminProfile } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateCollegeAdminProfileRepository(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, any>
): Promise<{ profile: CollegeAdminProfile | null; error?: string }> {
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: data as CollegeAdminProfile, error: undefined };
}
