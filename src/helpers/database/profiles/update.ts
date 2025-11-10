import { createClient } from "@/lib/supabase/server";

export async function updateStudentProfile(
  userId: string,
  updates: Record<string, any>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { profile: data };
}

export async function updateCollegeAdminProfile(
  userId: string,
  updates: Record<string, any>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { profile: data };
}
