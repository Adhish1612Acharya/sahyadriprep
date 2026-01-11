import { TABLES } from "@/constants";
import {
  InterviewSessionOverview,
  InterviewSessionSegment,
  InterviewSessionFlashcard,
  InterviewSessionTip,
} from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteInterviewSessionAiOverview(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionOverview | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionOverviews)
    .delete()
    .eq("youtube_video_id", id);

  return { data, error };
}

export async function deleteInterviewSessionAiSegments(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionSegment[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionSegments)
    .delete()
    .eq("youtube_video_id", id);

  return { data, error };
}

export async function deleteInterviewSessionAiFlashcards(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionFlashcard[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionFlashcards)
    .delete()
    .eq("youtube_video_id", id);

  return { data, error };
}

export async function deleteInterviewSessionAiTips(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionTip[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionTips)
    .delete()
    .eq("youtube_video_id", id);

  return { data, error };
}
