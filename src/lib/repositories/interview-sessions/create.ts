import { TABLES } from "@/constants";
import { InterviewSession } from "@/models/interview-session.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { InterviewSessionCreateParams } from "./types";

export async function createInterviewSession(
  supabase: SupabaseClient,
  videoData: InterviewSessionCreateParams
): Promise<{ data: InterviewSession | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessions)
    .insert(videoData)
    .select(`*`)
    .single();

  return { data, error };
}
