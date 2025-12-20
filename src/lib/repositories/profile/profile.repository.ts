import { SupabaseClient } from "@supabase/supabase-js";
import { ProfileRow } from "./profile.repository.types";
import z from "zod";

export async function fetchProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
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
): Promise<ProfileRow[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function fetchProfilesByCollegeIds(
  supabase: SupabaseClient,
  collegeIds: string[]
): Promise<ProfileRow[]> {
  if (collegeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("college_id", collegeIds);

  if (error) throw error;
  return data ?? ([] as ProfileRow[]);
}

// Fetch a single profile by college ID
export async function fetchProfilesByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as ProfileRow[]) ?? [];
}

export async function fetchStudentProfilesByCollegeId(
  supabase: SupabaseClient,
  collegeId: string
): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("college_id", collegeId)
    .eq("role", "student")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as ProfileRow[]) ?? [];
}
