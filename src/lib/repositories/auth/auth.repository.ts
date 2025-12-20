import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UserRole,
  CollegeAdminProfileRow,
  CollegeRow,
} from "./auth.repository.types";

export * from "./auth.repository.types";

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

export async function fetchCollegeAdminProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CollegeAdminProfileRow | null> {
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .select("id, college_id")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as CollegeAdminProfileRow;
}

export async function fetchCollegeById(
  supabase: SupabaseClient,
  collegeId: string
): Promise<CollegeRow | null> {
  const { data, error } = await supabase
    .from("colleges")
    .select("id, email_domain")
    .eq("id", collegeId)
    .single();

  if (error || !data) return null;
  return data as CollegeRow;
}
