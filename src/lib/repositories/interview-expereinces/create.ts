import { InterviewExperience } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { InterviewExperienceCreateInput } from "./types";
import { TABLES } from "@/constants";

export async function createInterviewExperience(
  supabase: SupabaseClient,
  input: InterviewExperienceCreateInput
): Promise<{ data: InterviewExperience | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.interviewExperiences)
    .insert(input)
    .select()
    .single();

  return { data, error };
}
