import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Core profile fetching logic - works with any Supabase client
 * @param supabase - Supabase client instance (server or client)
 * @param userId - User ID to fetch profile for
 */
export async function fetchProfileByUserIdCore(
  supabase: SupabaseClient,
  userId: string
) {
  // Get base profile (role)
  const { data: base, error: baseErr } = await supabase
    .from("profiles")
    .select("role, profile_completed, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (baseErr || !base) {
    return { error: baseErr?.message || "Profile not found" };
  }

  const role: string = base.role;

  // Fetch student profile
  if (role === "student") {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { role, profile: data };
  }

  // Fetch college admin profile
  if (role === "college_admin") {
    const { data, error } = await supabase
      .from("college_admin_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { role, profile: data };
  }

  // Super admin or unknown role - return base profile
  return { role, profile: base };
}
