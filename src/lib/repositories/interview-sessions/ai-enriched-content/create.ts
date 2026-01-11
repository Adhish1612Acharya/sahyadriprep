import { TABLES } from "@/constants";
import {
  InterviewSessionOverview,
  InterviewSessionSegment,
  InterviewSessionFlashcard,
  InterviewSessionTip,
} from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  InterviewSessionFlashcardInputRecord,
  InterviewSessionOverviewInputRecord,
  InterviewSessionSegmentInputRecord,
  InterviewSessionTipInputRecord,
} from "@/lib/repositories/interview-sessions/ai-enriched-content";

export async function createInterviewSessionAiOverview(
  supabase: SupabaseClient,
  overviewRecord: InterviewSessionOverviewInputRecord
): Promise<{ data: InterviewSessionOverview | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionOverviews)
    .insert(overviewRecord)
    .select()
    .single();

  return { data, error };
}

export async function createInterviewSessionAiSegments(
  supabase: SupabaseClient,
  segments: InterviewSessionSegmentInputRecord[]
): Promise<{ data: InterviewSessionSegment[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionSegments)
    .insert(segments)
    .select();

  return { data, error };
}

export async function createInterviewSessionAiFlashcards(
  supabase: SupabaseClient,
  flashcards: InterviewSessionFlashcardInputRecord[]
): Promise<{ data: InterviewSessionFlashcard[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionFlashcards)
    .insert(flashcards)
    .select();

  return { data, error };
}

export async function createInterviewSessionAiTips(
  supabase: SupabaseClient,
  tips: InterviewSessionTipInputRecord[]
): Promise<{ data: InterviewSessionTip[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessionTips)
    .insert(tips)
    .select();

  return { data, error };
}
