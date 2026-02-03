import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { withApiHandler } from "@/lib/api/server";
import { fetchInterviewSessionAISummaryContent } from "@/lib/services/interview-sessions";
import { HttpError } from "@/lib/api/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;

    if (!id) {
      throw new HttpError("Interview Session Id is required", 400, "NO_ID");
    }

    const supabase = await createClient();
    await requireAuth(supabase);

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
