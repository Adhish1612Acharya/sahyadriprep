import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchStudentProfilesByCollegeId } from "@/lib/repositories/profiles/fetch";
import { getAdminCollegeId } from "@/lib/services/admin";
import { fetchStudentsByCollegeId } from "@/lib/repositories/students";
import { handleSupabaseResult } from "@/helpers/supabase";
import { AuthProfile, StudentProfile } from "@/models";

export async function getStudentsForCurrentCollegeAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<
  Array<{
    authProfile: AuthProfile;
    studentProfile: StudentProfile | null;
  }>
> {
  const collegeId = await getAdminCollegeId(supabase, userId);

  // 1. Fetch all student profiles for the college
  const { data: studentsResult, error: studentsError } =
    await fetchStudentsByCollegeId(supabase, collegeId);

  const students = handleSupabaseResult(
    { data: studentsResult, error: studentsError },
    "lenient",
    "Students",
    { notFoundMessage: "No students found for the college" }
  );
  // 2. Fetch all auth profiles for the college
  const { data: authProfilesResult, error: authProfilesResultError } =
    await fetchStudentProfilesByCollegeId(supabase, collegeId);

  const authProfiles = handleSupabaseResult<AuthProfile[]>(
    { data: authProfilesResult, error: authProfilesResultError },
    "lenient",
    "Auth Profiles",
    { notFoundMessage: "No auth profiles found for the college" }
  );

  // 3. Map id to student profile for quick lookup
  const studentProfileMap = new Map(students.map((s) => [s.id, s]));

  // 4. Merge data
  return authProfiles.map((authProfile) => {
    const studentProfile = studentProfileMap.get(authProfile.id) ?? null;
    return {
      authProfile: authProfile,
      studentProfile: studentProfile,
    };
  });
}
