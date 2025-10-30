import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/interview-experiences/youtube-videos/:id/ai
 * Return AI-generated content for a video (overview, segments, flashcards, tips).
 * Each section includes presentInDB boolean and the stored data (or empty).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Video ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const [
      { data: overviewData, error: overviewError },
      { data: segmentsData, error: segmentsError },
      { data: flashcardsData, error: flashcardsError },
      { data: tipsData, error: tipsError },
    ] = await Promise.all([
      supabase
        .from("youtube_video_overviews")
        .select("*")
        .eq("youtube_video_id", id)
        .maybeSingle(),
      supabase
        .from("youtube_video_segments")
        .select("*")
        .eq("youtube_video_id", id)
        .order("segment_number", { ascending: true }),
      supabase
        .from("youtube_video_flashcards")
        .select("*")
        .eq("youtube_video_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("youtube_video_tips")
        .select("*")
        .eq("youtube_video_id", id)
        .order("created_at", { ascending: true }),
    ]);

    // Log non-fatal fetch errors for debugging
    if (overviewError) console.warn("Overview fetch error:", overviewError);
    if (segmentsError) console.warn("Segments fetch error:", segmentsError);
    if (flashcardsError)
      console.warn("Flashcards fetch error:", flashcardsError);
    if (tipsError) console.warn("Tips fetch error:", tipsError);

    return NextResponse.json({
      success: true,
      ai: {
        overview: {
          presentInDB: !!overviewData,
          data: overviewData ?? null,
        },
        segments: {
          presentInDB: Array.isArray(segmentsData) && segmentsData.length > 0,
          count: Array.isArray(segmentsData) ? segmentsData.length : 0,
          data: segmentsData ?? [],
        },
        flashcards: {
          presentInDB:
            Array.isArray(flashcardsData) && flashcardsData.length > 0,
          count: Array.isArray(flashcardsData) ? flashcardsData.length : 0,
          data: flashcardsData ?? [],
        },
        tips: {
          presentInDB: Array.isArray(tipsData) && tipsData.length > 0,
          count: Array.isArray(tipsData) ? tipsData.length : 0,
          data: tipsData ?? [],
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching AI content:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch AI content" },
      { status: 500 }
    );
  }
}
