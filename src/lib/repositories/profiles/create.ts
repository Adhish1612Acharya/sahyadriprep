import { TABLES } from "@/constants";
import { UserRole } from "@/types/common.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function insertUserProfile(
  supabase: SupabaseClient,
  params: {
    userId: string;
    email: string;
    role: UserRole;
    profile_completed: boolean;
  },
): Promise<any> {
  const { data, error } = await supabase
    .from(TABLES.profiles)
    .insert({
      id: params.userId,
      email: params.email,
      role: params.role,
      profile_completed: params.profile_completed,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
