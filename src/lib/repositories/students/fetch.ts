import type { SupabaseClient } from "@supabase/supabase-js";
import { StudentProfile } from "@/models";

export async function fetchStudentsByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<{ data: StudentProfile[] | null; error: any }> {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: true });

  return { data, error };
}

export async function fetchStudentById(
  supabase: SupabaseClient,
  studentId: string
): Promise<{ data: StudentProfile | null; error: any }> {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentId)
    .single();

  return {
    data,
    error,
  };
}
