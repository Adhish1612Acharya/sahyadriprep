import { TABLES } from "@/constants";
import { InterviewSession } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { InterviewSessionAIProcessUpdateRecord } from "./types";

export async function updateInterviewSessionAIMetadata(
  supabase: SupabaseClient,
  id: string,
  updateFields: InterviewSessionAIProcessUpdateRecord
): Promise<{ data: InterviewSession | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessions)
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}
