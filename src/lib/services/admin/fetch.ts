import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchProfileByUserId } from "@/lib/repositories/profiles/fetch";
import { handleSupabaseResult } from "@/helpers/supabase";
import { AuthProfile } from "@/models";
import { HttpError } from "@/lib/api/http";

export async function getAdminCollegeId(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: profileData, error: profileDataError } =
    await fetchProfileByUserId(supabase, userId);

  const adminAuthProfile = handleSupabaseResult<AuthProfile>(
    { data: profileData, error: profileDataError },
    "strict",
    "Profile",
    { notFoundMessage: "Admin profile not found" }
  );

  if (
    adminAuthProfile.role !== "college_admin" &&
    adminAuthProfile.role !== "super_admin"
  ) {
    throw new HttpError(
      "User is not a college admin or super admin",
      403,
      "FORBIDDEN",
      { userId }
    );
  }

  return adminAuthProfile.college_id;
}
