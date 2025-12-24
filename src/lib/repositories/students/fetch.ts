import type { SupabaseClient } from "@supabase/supabase-js";
import { StudentProfile } from "@/models";

export async function fetchStudentsByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<StudentProfile[]> {
  const { data: studentRows, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return studentRows ?? ([] as StudentProfile[]);
}

export async function fetchStudentById(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentProfile | null> {
  const { data: studentRow, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentId)
    .single();
  if (error) throw error;

  return studentRow ?? null;
}
