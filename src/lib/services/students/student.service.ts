import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchStudentProfilesByCollegeId } from "@/lib/repositories/profiles/fetch";
import { getAdminCollegeId } from "@/lib/services/admin/admin.service";
import { fetchStudentsByCollegeId } from "@/lib/repositories/students";
import { toCamelCase } from "@/helpers/transformers";

export async function getStudentsForCurrentCollegeAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<
  Array<{
    auth_profile: Record<string, any>;
    student_profile: Record<string, any> | null;
  }>
> {
  const collegeId = await getAdminCollegeId(supabase, userId);
  if (!collegeId) {
    throw new Error("College admin does not have an associated college");
  }

  // 1. Fetch all student profiles for the college
  const students = await fetchStudentsByCollegeId(supabase, collegeId);

  // 2. Fetch all auth profiles for the college
  const authProfiles = await fetchStudentProfilesByCollegeId(
    supabase,
    collegeId
  );

  // 3. Map id to student profile for quick lookup
  const studentProfileMap = new Map(students.map((s) => [s.id, s]));

  // 4. Merge data
  return toCamelCase(
    authProfiles.map((authProfile) => {
      const studentProfile = studentProfileMap.get(authProfile.id) ?? null;
      return {
        auth_profile: authProfile,
        student_profile: studentProfile,
      };
    })
  );
}
