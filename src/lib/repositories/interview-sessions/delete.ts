import { TABLES } from "@/constants";
import { InterviewSession } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteOwnCreatedInterviewSessionForCollege(
  supabase: SupabaseClient,
  interviewSessionId: string,
  collegeId: string,
  userId: string
): Promise<{ data: InterviewSession | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessions)
    .delete()
    .eq("id", interviewSessionId)
    .eq("college_id", collegeId)
    .eq("created_by", userId)
    .single();

  return { data, error };
}


