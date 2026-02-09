import { extractYouTubeVideoId } from "@/helpers/youtube";
import { HttpError } from "@/lib/api/http";
import { ContentChunk, InterviewSession } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  checkYouTubeInterviewSessionExistsForCollege,
  createInterviewSessionAiFlashcardsService,
  createInterviewSessionAiOverviewService,
  createInterviewSessionAiSegmentsService,
  createInterviewSessionAiTipsService,
  deleteInterviewSessionAiFlashcardsService,
  deleteInterviewSessionAiOverviewService,
  deleteInterviewSessionAiSegmentsService,
  deleteInterviewSessionAiTipsService,
  getInterviewSessionDetailsForCollege,
} from "@/lib/services/interview-sessions";
import {
  fetchYouTubeMetadata,
  fetchYouTubeTranscript,
  generateFlashcards,
  generateKeyTips,
  generateOverview,
  generateSegments,
} from "@/features/youtube";
import { createInterviewSessionService } from "@/lib/services/interview-sessions";
import { processInterviewSessionToChunks } from "@/lib/services/rag";
import { ENV } from "@/config/env";
import { updateInterviewSessionAIMetadataService } from "@/lib/services/interview-sessions/update";
import { InterviewSessionAISummarizationResult } from "@/lib/services/interview-sessions/types";

export async function createInterviewSessionForCollegeOrchestrator(
  supabase: SupabaseClient,
  vectorSupabase: SupabaseClient,
  videoUrl: string,
  companyId: string,
  collegeId: string,
  userId: string
): Promise<{
  newInterviewSession: InterviewSession;
  interviewSessionRagContent: ContentChunk[];
}> {
  // 1. Extract video ID
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) {
    throw new HttpError("Invalid YouTube URL", 400, "INVALID_YOUTUBE_URL");
  }

  // 2. Check duplicate
  const interviewSession = await checkYouTubeInterviewSessionExistsForCollege(
    supabase,
    videoId,
    collegeId
  );
  if (interviewSession.exists) {
    throw new HttpError("Video already exists", 409, "VIDEO_EXISTS", {
      data: interviewSession.data,
    });
  }

  // 3. Fetch metadata
  const metadataResult = await fetchYouTubeMetadata(videoId);

  if (!metadataResult.success || !metadataResult.data) {
    throw new HttpError(
      metadataResult.error || "Failed to fetch YouTube metadata",
      500,
      "YOUTUBE_METADATA_FETCH_FAILED"
    );
  }

  const metadata = metadataResult.data;

  // 4. Clean URL + create
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const videoData = {
    video_id: metadata.video_id || videoId,
    video_url: cleanUrl,
    title: metadata.title,
    description: metadata.description,
    thumbnail_url: metadata.thumbnail_url,
    duration: metadata.duration,
    company_id: companyId,
    college_id: collegeId,
    created_by: userId,
  };

  const newInterviewSession = await createInterviewSessionService(
    supabase,
    videoData
  );

  const transcriptResult = await fetchYouTubeTranscript(videoId);

  if (!transcriptResult.success || !transcriptResult.data) {
    throw new HttpError(
      transcriptResult.error || "Failed to fetch YouTube transcript",
      500,
      "YOUTUBE_TRANSCRIPT_FETCH_FAILED"
    );
  }

  const transcriptSegments = transcriptResult.data;

  let interviewSessionRagContent: ContentChunk[] = [];

  if (transcriptSegments && transcriptSegments.segments.length > 0) {
    // 5. Process embeddings (fire-and-forget)
    interviewSessionRagContent = await processInterviewSessionToChunks(
      vectorSupabase,
      {
        title: videoData.title,
        description: videoData.description,
        transcriptSegments: transcriptSegments?.segments || [],
        videoId: videoData.video_id,
        videoUrl: videoData.video_url,
        companyId: videoData.company_id,
        collegeId: videoData.college_id,
        sessionId: newInterviewSession.id,
        createdBy: videoData.created_by,
      }
    );
  }

  return {
    newInterviewSession,
    interviewSessionRagContent,
  };
}

export async function processInterviewSessionAISummarizationOrchestrator(
  supabase: SupabaseClient,
  collegeId: string,
  {
    id,
    videoId,
    title,
    description,
  }: { id: string; videoId: string; title: string; description: string }
): Promise<InterviewSessionAISummarizationResult> {
  const videoData = await getInterviewSessionDetailsForCollege(
    supabase,
    id,
    collegeId
  );

  // Step 1: Fetch transcript
  const transcript = await fetchYouTubeTranscript(videoId);
  if ((!transcript.success && transcript.error) || !transcript.data) {
    throw new HttpError(
      transcript.error || "Transcript not available",
      404,
      "TRANSCRIPT_NOT_AVAILABLE"
    );
  }

  // Step 2: Generate AI content
  const startTime = Date.now();
  const [overview, segments, flashcards, tips] = await Promise.all([
    generateOverview(
      title,
      description,
      transcript.data.text,
      ENV.GEMINI_API_KEY_OVERVIEW!
    ),
    generateSegments(
      title,
      transcript.data.segments,
      ENV.GEMINI_API_KEY_SEGMENTS!
    ),
    generateFlashcards(
      title,
      transcript.data.text,
      ENV.GEMINI_API_KEY_FLASHCARDS!
    ),
    generateKeyTips(title, transcript.data.text, ENV.GEMINI_API_KEY_TIPS!),
  ]);
  const processingTime = Date.now() - startTime;

  // Step 3: Save to DB (delete old, insert new)
  // 1) Overview
  await deleteInterviewSessionAiOverviewService(supabase, id);
  await createInterviewSessionAiOverviewService(supabase, {
    youtube_video_id: id,
    summary: overview.summary,
    key_points: overview.key_points || [],
    topics: overview.topics || [],
    difficulty_level: overview.difficulty_level || "intermediate",
    recommended_for: overview.recommended_for || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 2) Segments
  await deleteInterviewSessionAiSegmentsService(supabase, id);
  if (Array.isArray(segments) && segments.length > 0) {
    const segmentsToInsert = segments.map((seg: any) => ({
      youtube_video_id: id,
      segment_number: seg.segment_number,
      title: seg.title,
      description: seg.description,
      start_time: seg.start_time,
      end_time: seg.end_time,
      key_concepts: seg.key_concepts || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    await createInterviewSessionAiSegmentsService(supabase, segmentsToInsert);
  }

  // 3) Flashcards
  await deleteInterviewSessionAiFlashcardsService(supabase, id);
  if (Array.isArray(flashcards) && flashcards.length > 0) {
    const flashcardsToInsert = flashcards.map((f: any) => ({
      youtube_video_id: id,
      question: f.question,
      answer: f.answer,
      difficulty: f.difficulty,
      category: f.category,
      timestamp: f.timestamp ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    await createInterviewSessionAiFlashcardsService(
      supabase,
      flashcardsToInsert
    );
  }

  // 4) Tips
  await deleteInterviewSessionAiTipsService(supabase, id);
  if (Array.isArray(tips) && tips.length > 0) {
    const tipsToInsert = tips.map((t: any) => ({
      youtube_video_id: id,
      tip_text: t.tip_text,
      category: t.category,
      importance: t.importance,
      context: t.context ?? null,
      timestamp: t.timestamp ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    await createInterviewSessionAiTipsService(supabase, tipsToInsert);
  }

  // 5) Update youtube_videos metadata
  const aiMeta = {
    last_processed_at: new Date().toISOString(),
    processing_time_ms: processingTime,
    ai_model: "gemini-2.5-flash",
    counts: {
      segments: Array.isArray(segments) ? segments.length : 0,
      flashcards: Array.isArray(flashcards) ? flashcards.length : 0,
      tips: Array.isArray(tips) ? tips.length : 0,
    },
  };
  const newCount = (videoData.ai_process_count || 0) + 1;
  await updateInterviewSessionAIMetadataService(supabase, id, {
    ai_process_done: true,
    ai_process_count: newCount,
    ai_process_metadata: aiMeta,
    updated_at: new Date().toISOString(),
  });

  // Return all relevant data for response
  return {
    videoId: id,
    // transcript: {
    //   text: transcript.data.text,
    //   segmentsCount: transcript.data.segments.length,
    //   duration: transcript.data.duration,
    //   language: transcript.data.language,
    // },
    overview,
    segments: {
      count: Array.isArray(segments) ? segments.length : 0,
      data: segments,
    },
    flashCards: {
      count: Array.isArray(flashcards) ? flashcards.length : 0,
      data: flashcards,
    },
    tips: {
      count: Array.isArray(tips) ? tips.length : 0,
      data: tips,
    },
    metaData: {
      processedAt: new Date().toISOString(),
      processingTimeMs: processingTime,
    },
  };
}
