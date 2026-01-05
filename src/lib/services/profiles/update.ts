import { SupabaseClient } from "@supabase/supabase-js";
import { CompleteProfileResult } from "./types";
import { fetchCompleteUserProfile } from "./fetch";
import { updateStudentProfileRepository } from "@/lib/repositories/students";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateCollegeAdminProfileRepository } from "@/lib/repositories/admin";
import { CollegeAdminProfile, StudentProfile } from "@/models";

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, any>
): Promise<CompleteProfileResult> {
  // 1. Get user role first
  const profileResult = await fetchCompleteUserProfile(supabase, userId);

  const { role } = profileResult;

  // 2. Route to correct repository
  if (role === "student") {
    const { data, error } = await updateStudentProfileRepository(
      supabase,
      userId,
      updates
    );
    const updatedProfile = handleSupabaseResult<StudentProfile>(
      { data, error },
      "strict",
      "StudentProfile",
      { userId }
    );
    return { profile: updatedProfile, role };
  }

  if (role === "college_admin") {
    const { data, error } = await updateCollegeAdminProfileRepository(
      supabase,
      userId,
      updates
    );
    const updatedProfile = handleSupabaseResult<CollegeAdminProfile>(
      { data, error },
      "strict",
      "CollegeAdminProfile",
      { userId }
    );
    return { profile: updatedProfile, role };
  }

  return { profile: profileResult.profile, role };
}
