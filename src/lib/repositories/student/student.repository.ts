import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudentRow } from "./student.repository.types";

export * from "./student.repository.types";

export async function fetchStudentsByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<StudentRow[]> {
  const { data: studentRows, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return studentRows ?? ([] as StudentRow[]);
}
