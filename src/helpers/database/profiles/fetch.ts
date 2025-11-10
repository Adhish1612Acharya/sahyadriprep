import { createClient } from "@/lib/supabase/server";

export async function fetchProfileByUserId(userId: string) {
  const supabase = await createClient();

  // Get base profile (role)
  const { data: base, error: baseErr } = await supabase
    .from("profiles")
    .select("role, profile_completed, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (baseErr || !base)
    return { error: baseErr?.message || "Profile not found" };

  const role: string = base.role;

  if (role === "student") {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return { error: error.message };
    return { role, profile: data };
  }

  if (role === "college_admin") {
    const { data, error } = await supabase
      .from("college_admin_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return { error: error.message };
    return { role, profile: data };
  }

  // default: return base only for super_admin or unknown
  return { role, profile: base };
}
