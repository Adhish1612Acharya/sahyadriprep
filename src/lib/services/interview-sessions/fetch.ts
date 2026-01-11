import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchInterviewSessionsForCollege,
  fetchInterviewSessionForCollegeFromYouTubeVideoId,
  fetchInterviewSessionDetailsForCollege,
} from "@/lib/repositories/interview-sessions";
import type {
  InterviewSessionFilters,
  InterviewSessionWithCollegeAndCompanyDetails,
} from "@/lib/repositories/interview-sessions";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchInterviewSessionFlashcards,
  fetchInterviewSessionOverview,
  fetchInterviewSessionSegments,
  fetchInterviewSessionTips,
} from "@/lib/repositories/interview-sessions/ai-enriched-content";
import {
  InterviewSessionFlashcard,
  InterviewSessionOverview,
  InterviewSessionTip,
} from "@/models";

export async function getInterviewSessionsForCollege(
  supabase: SupabaseClient,
  collegeId: string,
  filters: InterviewSessionFilters
): Promise<InterviewSessionWithCollegeAndCompanyDetails[]> {
  const { data, error } = await fetchInterviewSessionsForCollege(
    supabase,
    filters,
    collegeId
  );

  return handleSupabaseResult<InterviewSessionWithCollegeAndCompanyDetails[]>(
    { data, error },
    "lenient",
    "Interview Sessions"
  );
}

export async function getInterviewSessionForCollegeFromYouTubeVideoId(
  supabase: SupabaseClient,
  videoId: string,
  collegeId: string
): Promise<InterviewSessionWithCollegeAndCompanyDetails | null> {
  const { data, error } =
    await fetchInterviewSessionForCollegeFromYouTubeVideoId(
      supabase,
      videoId,
      collegeId
    );
  return handleSupabaseResult<InterviewSessionWithCollegeAndCompanyDetails | null>(
    { data, error },
    "lenient",
    "Interview Session"
  );
}

export async function getInterviewSessionDetailsForCollege(
  supabase: SupabaseClient,
  interviewSessionId: string,
  collegeId: string
): Promise<InterviewSessionWithCollegeAndCompanyDetails> {
  const { data, error } = await fetchInterviewSessionDetailsForCollege(
    supabase,
    interviewSessionId,
    collegeId
  );

  return handleSupabaseResult<InterviewSessionWithCollegeAndCompanyDetails>(
    { data, error },
    "strict",
    "Interview Session Details"
  );
}

export async function checkYouTubeInterviewSessionExistsForCollege(
  supabase: SupabaseClient,
  videoId: string,
  collegeId: string
): Promise<{
  exists: boolean;
  data: InterviewSessionWithCollegeAndCompanyDetails | null;
}> {
  const interviewSession =
    await getInterviewSessionForCollegeFromYouTubeVideoId(
      supabase,
      videoId,
      collegeId
    );

  return {
    exists: interviewSession !== null,
    data: interviewSession || null,
  };
}

export async function fetchInterviewSessionOverviewService(
  supabase: SupabaseClient,
  id: string
) {
  const result = await fetchInterviewSessionOverview(supabase, id);
  return (
    handleSupabaseResult<InterviewSessionOverview | null>(
      result,
      "lenient",
      "YoutubeVideoOverview"
    ) || null
  );
}

export async function fetchInterviewSessionSegmentsService(
  supabase: SupabaseClient,
  id: string
) {
  const result = await fetchInterviewSessionSegments(supabase, id);
  return handleSupabaseResult(result, "lenient", "YoutubeVideoSegments") || [];
}

export async function fetchInterviewSessionFlashcardsService(
  supabase: SupabaseClient,
  id: string
) {
  const result = await fetchInterviewSessionFlashcards(supabase, id);
  return (
    handleSupabaseResult<InterviewSessionFlashcard[]>(
      result,
      "lenient",
      "YoutubeVideoFlashcards"
    ) || []
  );
}

export async function fetchInterviewSessionTipsService(
  supabase: SupabaseClient,
  id: string
) {
  const result = await fetchInterviewSessionTips(supabase, id);
  return (
    handleSupabaseResult<InterviewSessionTip[]>(
      result,
      "lenient",
      "YoutubeVideoTips"
    ) || []
  );
}

export async function fetchInterviewSessionAISummaryContent(
  supabase: SupabaseClient,
  id: string
) {
  const [overviewData, segmentsData, flashcardsData, tipsData] =
    await Promise.all([
      fetchInterviewSessionOverviewService(supabase, id),
      fetchInterviewSessionSegmentsService(supabase, id),
      fetchInterviewSessionFlashcardsService(supabase, id),
      fetchInterviewSessionTipsService(supabase, id),
    ]);

  return {
    overviewData,
    segmentsData,
    flashcardsData,
    tipsData,
  };
}
