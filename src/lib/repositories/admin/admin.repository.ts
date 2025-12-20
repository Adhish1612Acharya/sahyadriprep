import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminCollegeRow } from "./admin.repository.types";

export * from "./admin.repository.types";

export async function fetchAdminCollegeByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminCollegeRow | null> {
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .select("id, college_id")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!data) return null;

  // profiles comes back as an array of rows
  const profilesArray = (data as any).profiles as { role: string }[] | null;

  const role =
    profilesArray && profilesArray.length > 0 ? profilesArray[0].role : null;

  return {
    userId: data.id,
    collegeId: data.college_id,
    role,
  };
}
