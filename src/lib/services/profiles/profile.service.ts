import {
  fetchCollegeAdminByUserId,
  updateCollegeAdminProfileRepository,
} from "@/lib/repositories/admin";
import { fetchProfileByUserId } from "@/lib/repositories/profiles";
import {
  fetchStudentById,
  updateStudentProfileRepository,
} from "@/lib/repositories/students";
import { SupabaseClient } from "@supabase/supabase-js";
import { CompleteProfileResult, UpdateProfileResult } from "./types";

export async function fetchCompleteUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CompleteProfileResult> {
  try {
    // 1. Get base auth profile FIRST (determines role)
    const baseProfile = await fetchProfileByUserId(supabase, userId);
    if (!baseProfile) {
      return { type: "error", error: "Base profile not found" };
    }

    const { role } = baseProfile;

    // 2. Route by role to extended profile
    if (role === "student") {
      const studentProfile = await fetchStudentById(supabase, userId);
      if (!studentProfile) {
        return { type: "error", error: "Student profile not found" };
      }
      return { type: "success", role, profile: studentProfile };
    }

    if (role === "college_admin") {
      const adminProfile = await fetchCollegeAdminByUserId(supabase, userId);
      if (!adminProfile) {
        return { type: "error", error: "College admin profile not found" };
      }
      return { type: "success", role, profile: adminProfile };
    }

    // 3. Super admin or other roles: return base profile
    return { type: "success", role, profile: baseProfile };
  } catch (error) {
    return {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, any>
): Promise<UpdateProfileResult> {
  // 1. Get user role first
  const profileResult = await fetchCompleteUserProfile(supabase, userId);
  if (profileResult.type === "error") {
    return { type: "error", error: profileResult.error };
  }

  const { role } = profileResult;

  // 2. Route to correct repository
  if (role === "student") {
    const result = await updateStudentProfileRepository(
      supabase,
      userId,
      updates
    );
    if (result.error) return { type: "error", error: result.error };
    return { type: "success", role, profile: result.profile };
  }

  if (role === "college_admin") {
    const result = await updateCollegeAdminProfileRepository(
      supabase,
      userId,
      updates
    );
    if (result.error) return { type: "error", error: result.error };
    return { type: "success", role, profile: result.profile };
  }

  return { type: "error", error: "Unsupported role for profile updates" };
}
