import { fetchCollegeAdminByUserId } from "@/lib/repositories/admin";
import { fetchProfileByUserId } from "@/lib/repositories/profiles";
import { fetchStudentById } from "@/lib/repositories/students";
import { SupabaseClient } from "@supabase/supabase-js";
import { CompleteProfileResult } from "./types";
import { handleSupabaseResult } from "@/helpers/supabase";
import { AuthProfile, CollegeAdminProfile, StudentProfile } from "@/models";

export async function fetchCompleteUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CompleteProfileResult> {
  // 1. Get base auth profile FIRST (determines role)
  const { data: baseProfileData, error: baseProfileError } =
    await fetchProfileByUserId(supabase, userId);

  const baseProfile = handleSupabaseResult<AuthProfile>(
    { data: baseProfileData, error: baseProfileError },
    "strict",
    "AuthProfile",
    { userId }
  );

  const { role } = baseProfile;

  // 2. Route by role to extended profile
  if (role === "student") {
    const { data: studentProfileData, error: studentProfileError } =
      await fetchStudentById(supabase, userId);
    const studentProfile = handleSupabaseResult<StudentProfile>(
      { data: studentProfileData, error: studentProfileError },
      "strict",
      "StudentProfile",
      { userId }
    );
    return { profile: studentProfile, role };
  }

  if (role === "college_admin") {
    const { data: adminProfileData, error: adminProfileError } =
      await fetchCollegeAdminByUserId(supabase, userId);
    const adminProfile = handleSupabaseResult<CollegeAdminProfile>(
      { data: adminProfileData, error: adminProfileError },
      "strict",
      "CollegeAdminProfile",
      { userId }
    );
    return { profile: adminProfile, role };
  }

  // 3. Super admin or other roles: return base profile
  return { profile: baseProfile, role };
}

export async function fetchAuthProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<AuthProfile> {
  const { data: userAuthProfile, error } = await fetchProfileByUserId(
    supabase,
    userId
  );

  return handleSupabaseResult<AuthProfile>(
    { data: userAuthProfile, error },
    "strict",
    "AuthProfile",
    {}
  );
}

export async function fetchUserCollegeIdFromProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const userAuthProfile = await fetchAuthProfileByUserId(supabase, userId);

  return userAuthProfile.college_id;
}
