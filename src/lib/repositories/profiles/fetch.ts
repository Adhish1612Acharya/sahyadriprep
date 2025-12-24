import { AuthProfile, CollegeAdminProfile } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data ?? null;
}

export async function fetchProfilesByUserIds(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<AuthProfile[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (error) throw error;
  return (data ?? []) as AuthProfile[];
}

export async function fetchProfilesByCollegeIds(
  supabase: SupabaseClient,
  collegeIds: string[]
): Promise<AuthProfile[]> {
  if (collegeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("college_id", collegeIds);

  if (error) throw error;
  return data ?? ([] as AuthProfile[]);
}

// Fetch a single profile by college ID
export async function fetchProfilesByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<AuthProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as AuthProfile[]) ?? [];
}

export async function fetchStudentProfilesByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<AuthProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("college_id", collegeId)
    .eq("role", "student")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as AuthProfile[]) ?? [];
}

export async function fetchCollegeAdminProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CollegeAdminProfile | null> {
  const { data, error } = await supabase
    .from("college_admin_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as CollegeAdminProfile;
}
