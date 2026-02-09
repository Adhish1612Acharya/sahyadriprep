import type { SupabaseClient, User } from "@supabase/supabase-js";
import { adminUpdateUserMetadata } from "@/lib/repositories/auth";
import { fetchProfileByUserId } from "@/lib/repositories/profiles";
import { UserRole } from "@/types/common.types";
import { handleSupabaseResult } from "@/helpers/supabase";
import { AuthProfile } from "@/models";

export async function updateUserMetadata(
  userId: string,
  metadata: {
    role: UserRole;
    college_id?: string | null;
    profile_completed: boolean;
    [key: string]: any;
  },
): Promise<User | null> {
  const { data, error } = await adminUpdateUserMetadata(userId, metadata);
  const updateUserMetadataResult = handleSupabaseResult<User | null>(
    { data, error },
    "lenient",
    "User Metadata",
    { notFoundMessage: "User not found for metadata update" },
  );

  return updateUserMetadataResult;
}

export async function syncProfileToMetadata(
  supabase: SupabaseClient,
  userId: string,
): Promise<AuthProfile | null> {
  const { data: authProfileData, error: authProfileDataError } =
    await fetchProfileByUserId(supabase, userId);

  const authProfile = handleSupabaseResult<AuthProfile>(
    {
      data: authProfileData,
      error: authProfileDataError,
    },
    "strict",
    "Profile",
    { notFoundMessage: "User profile not found for metadata sync" },
  );

  const updatedUserMetadata = await updateUserMetadata(userId, {
    role: authProfile.role,
    profile_completed: authProfile.profile_completed,
  });

  return updatedUserMetadata ? authProfile : null;
}
