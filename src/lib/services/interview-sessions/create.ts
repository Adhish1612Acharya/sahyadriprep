import { handleSupabaseResult } from "@/helpers/supabase";
import {
  createInterviewSession,
  InterviewSessionCreateParams,
} from "@/lib/repositories/interview-sessions";
import {
  createInterviewSessionAiFlashcards,
  createInterviewSessionAiOverview,
  createInterviewSessionAiSegments,
  createInterviewSessionAiTips,
  InterviewSessionFlashcardInputRecord,
  InterviewSessionOverviewInputRecord,
  InterviewSessionSegmentInputRecord,
  InterviewSessionTipInputRecord,
} from "@/lib/repositories/interview-sessions/ai-enriched-content";
import {
  InterviewSession,
  InterviewSessionFlashcard,
  InterviewSessionOverview,
  InterviewSessionSegment,
  InterviewSessionTip,
} from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function createInterviewSessionService(
  supabase: SupabaseClient,
  params: InterviewSessionCreateParams
): Promise<InterviewSession> {
  const result = await createInterviewSession(supabase, params);
  return handleSupabaseResult<InterviewSession>(
    result,
    "strict",
    "Interview Session"
  );
}

export async function createInterviewSessionAiOverviewService(
  supabase: SupabaseClient,
  overviewRecord: InterviewSessionOverviewInputRecord
): Promise<InterviewSessionOverview | null> {
  const result = await createInterviewSessionAiOverview(
    supabase,
    overviewRecord
  );
  return handleSupabaseResult(result, "lenient", "CreateOverview") || null;
}

export async function createInterviewSessionAiSegmentsService(
  supabase: SupabaseClient,
  segments: InterviewSessionSegmentInputRecord[]
): Promise<InterviewSessionSegment[]> {
  const result = await createInterviewSessionAiSegments(supabase, segments);
  return handleSupabaseResult(result, "lenient", "CreateSegments") || [];
}

export async function createInterviewSessionAiFlashcardsService(
  supabase: SupabaseClient,
  flashcards: InterviewSessionFlashcardInputRecord[]
): Promise<InterviewSessionFlashcard[]> {
  const result = await createInterviewSessionAiFlashcards(supabase, flashcards);
  return handleSupabaseResult(result, "lenient", "CreateFlashcards") || [];
}

export async function createInterviewSessionAiTipsService(
  supabase: SupabaseClient,
  tips: InterviewSessionTipInputRecord[]
): Promise<InterviewSessionTip[]> {
  const result = await createInterviewSessionAiTips(supabase, tips);
  return handleSupabaseResult(result, "lenient", "CreateTips") || [];
}
