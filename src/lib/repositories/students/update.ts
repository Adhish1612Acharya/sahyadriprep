// repositories/student/update-student.repository.ts
import { StudentProfile } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateStudentProfileRepository(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, any>
): Promise<{ profile: StudentProfile | null; error?: string }> {
  const { data, error } = await supabase
    .from("student_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: data as StudentProfile, error: undefined };
}
