import type { SupabaseClient } from "@supabase/supabase-js";
import { adminUpdateUserMetadata } from "@/lib/repositories/auth";
import { fetchProfileByUserId } from "@/lib/repositories/profiles";
import { UserRole } from "@/types/common.types";

export async function updateUserMetadata(
  userId: string,
  metadata: {
    role: UserRole;
    college_id?: string | null;
    profile_completed: boolean;
    [key: string]: any;
  }
) {
  try {
    const user = await adminUpdateUserMetadata(userId, metadata);
    return { success: true, user };
  } catch (e: any) {
    return { success: false, error: e };
  }
}

export async function syncProfileToMetadata(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; error?: any; profile?: any }> {
  try {
    const profile = await fetchProfileByUserId(supabase, userId);
    if (!profile) {
      return { success: false, error: new Error("Profile not found") };
    }

    const result = await updateUserMetadata(userId, {
      role: profile.role,
      profile_completed: profile.profile_completed,
    });

    if (!result.success) return result;

    return { success: true, profile };
  } catch (e: any) {
    return { success: false, error: e };
  }
}
