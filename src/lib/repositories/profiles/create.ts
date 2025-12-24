import { UserRole } from "@/types/common.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function insertUserProfile(
  supabase: SupabaseClient,
  params: {
    userId: string;
    email: string;
    role: UserRole;
    profile_completed: boolean;
  }
): Promise<void> {
  const { error } = await supabase.from("profiles").insert({
    id: params.userId,
    email: params.email,
    role: params.role,
    profile_completed: params.profile_completed,
  });

  if (error) throw error;
}
