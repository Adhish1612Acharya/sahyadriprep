// repositories/student/update-student.repository.ts
import { TABLES } from "@/constants";
import { StudentProfile } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateStudentProfileRepository(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, any>
): Promise<{ data: StudentProfile | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.studentProfiles)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  return { data, error };
}
