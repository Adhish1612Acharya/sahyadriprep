import type { SupabaseClient } from "@supabase/supabase-js";
import { StudentProfile } from "@/models";
import { TABLES } from "@/constants";

export async function fetchStudentsByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<{ data: StudentProfile[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.studentProfiles)
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
    .from(TABLES.studentProfiles)
    .select("*")
    .eq("id", studentId)
    .single();

  return {
    data,
    error,
  };
}
