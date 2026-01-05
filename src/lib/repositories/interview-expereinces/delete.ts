import type { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { InterviewExperience } from "@/models";

export async function deleteInterviewExperienceById(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewExperience | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.interviewExperiences)
    .delete()
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteOwnInterviewExperienceForCollege(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  collegeId: string
): Promise<{ data: InterviewExperience | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.interviewExperiences)
    .delete()
    .eq("id", id)
    .eq("created_by", userId)
    .eq("college_id", collegeId)
    .select()
    .single();

  return { data, error };
}
