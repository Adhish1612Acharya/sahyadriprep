import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { withApiHandler } from "@/lib/api/server";
import {
  fetchInterviewSessionAISummaryContent,
  processInterviewSessionAISummarizationOrchestrator,
} from "@/lib/services/interview-sessions";
import { fetchUserCollegeIdFromProfile } from "@/lib/services/profiles";
import { HttpError } from "@/lib/api/http";

/**
 * POST /api/interview-experiences/youtube-videos/:id/process
 * Process video with AI to generate all features and save to DB
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const body = await request.json();
    const { videoId, title, description } = body;

    const missingFields = [];

    if (!id) missingFields.push("Interview Session Id");
    if (!videoId) missingFields.push("video_id");
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");

    if (!id || !videoId || !title || !description) {
      throw new HttpError("Missing required fields", 400, "MISSING_FIELDS", {
        missingFields: { sessionId: id, videoId, title, description },
      });
    }

    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const userCollegeId = await fetchUserCollegeIdFromProfile(
      supabase,
      user.id,
    );

    await processInterviewSessionAISummarizationOrchestrator(
      supabase,
      userCollegeId,
      { id, videoId, title, description },
    );

    const { overviewData, segmentsData, flashCardsData, tipsData } =
      await fetchInterviewSessionAISummaryContent(supabase, id);

    return NextResponse.json({
      success: true,
      aiSummary: {
        overview: {
          presentInDB: !!overviewData,
          data: overviewData ?? null,
        },
        segments: {
          presentInDB: Array.isArray(segmentsData) && segmentsData.length > 0,
          count: Array.isArray(segmentsData) ? segmentsData.length : 0,
          data: segmentsData ?? [],
        },
        flashCards: {
          presentInDB:
            Array.isArray(flashCardsData) && flashCardsData.length > 0,
          count: Array.isArray(flashCardsData) ? flashCardsData.length : 0,
          data: flashCardsData ?? [],
        },
        tips: {
          presentInDB: Array.isArray(tipsData) && tipsData.length > 0,
          count: Array.isArray(tipsData) ? tipsData.length : 0,
          data: tipsData ?? [],
        },
      },
    });
  });
}
