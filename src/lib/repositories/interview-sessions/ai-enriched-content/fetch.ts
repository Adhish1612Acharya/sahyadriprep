import { TABLES } from "@/constants";
import {
  InterviewSessionFlashcard,
  InterviewSessionOverview,
  InterviewSessionSegment,
  InterviewSessionTip,
} from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchInterviewSessionOverview(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionOverview | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionOverviews)
    .select("*")
    .eq("youtube_video_id", id)
    .single();

  return { data, error };
}

export async function fetchInterviewSessionSegments(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionSegment[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionSegments)
    .select("*")
    .eq("youtube_video_id", id)
    .order("segment_number", { ascending: true });

  return { data, error };
}

export async function fetchInterviewSessionFlashcards(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionFlashcard[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionFlashcards)
    .select("*")
    .eq("youtube_video_id", id)
    .order("created_at", { ascending: true });

  return { data, error };
}

export async function fetchInterviewSessionTips(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: InterviewSessionTip[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionTips)
    .select("*")
    .eq("youtube_video_id", id)
    .order("created_at", { ascending: true });

  return { data, error };
}
