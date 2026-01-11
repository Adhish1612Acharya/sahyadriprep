import { handleSupabaseResult } from "@/helpers/supabase";
import {
  deleteInterviewSessionAiFlashcards,
  deleteInterviewSessionAiOverview,
  deleteInterviewSessionAiSegments,
  deleteInterviewSessionAiTips,
} from "@/lib/repositories/interview-sessions/ai-enriched-content";
import { deleteOwnCreatedInterviewSessionForCollege } from "@/lib/repositories/interview-sessions/delete";
import {
  InterviewSession,
  InterviewSessionFlashcard,
  InterviewSessionOverview,
  InterviewSessionSegment,
  InterviewSessionTip,
} from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteOwnCreatedInterviewSessionForCollegeService(
  supabase: SupabaseClient,
  interviewSessionId: string,
  collegeId: string,
  userId: string
): Promise<InterviewSession> {
  const { data, error } = await deleteOwnCreatedInterviewSessionForCollege(
    supabase,
    interviewSessionId,
    collegeId,
    userId
  );

  return handleSupabaseResult({ data, error }, "strict", "InterviewSession");
}

export async function deleteInterviewSessionAiOverviewService(
  supabase: SupabaseClient,
  id: string
): Promise<InterviewSessionOverview | null> {
  const result = await deleteInterviewSessionAiOverview(supabase, id);
  return handleSupabaseResult(result, "strict", "DeleteOverview") || null;
}

export async function deleteInterviewSessionAiSegmentsService(
  supabase: SupabaseClient,
  id: string
): Promise<InterviewSessionSegment[]> {
  const result = await deleteInterviewSessionAiSegments(supabase, id);
  return handleSupabaseResult(result, "strict", "DeleteSegments") || [];
}

export async function deleteInterviewSessionAiFlashcardsService(
  supabase: SupabaseClient,
  id: string
): Promise<InterviewSessionFlashcard[]> {
  const result = await deleteInterviewSessionAiFlashcards(supabase, id);
  return handleSupabaseResult(result, "strict", "DeleteFlashcards") || [];
}

export async function deleteInterviewSessionAiTipsService(
  supabase: SupabaseClient,
  id: string
): Promise<InterviewSessionTip[]> {
  const result = await deleteInterviewSessionAiTips(supabase, id);
  return handleSupabaseResult(result, "strict", "DeleteTips") || [];
}
