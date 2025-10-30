import { fetchYouTubeTranscript } from "@/helpers/youtube-video.helpers";
import { AI_KEYS, validateAIKeys } from "@/config/ai-keys.config";
import {
  generateOverview,
  generateSegments,
  generateFlashcards,
  generateKeyTips,
} from "@/helpers/ai-generation.helpers";
import { NextRequest, NextResponse } from "next/server";

// Validate API keys on startup
validateAIKeys();

/**
 * POST /api/interview-experiences/youtube-videos/:id/process
 * Process video with AI to generate all features
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { video_id, title, description } = body;

    console.log("🎬 Starting AI processing for video:", id);

    // Step 1: Fetch YouTube transcript
    console.log("📝 Fetching transcript...");
    const transcript = await fetchYouTubeTranscript(video_id);

    if (!transcript) {
      return NextResponse.json(
        {
          success: false,
          error: "Transcript not available for this video",
        },
        { status: 400 }
      );
    }

    console.log("✅ Transcript fetched:", transcript.text.length, "characters");

    // Step 2: Generate all AI features in parallel with separate API keys
    console.log("🤖 Generating AI content with Gemini (distributed keys)...");

    const startTime = Date.now();

    const [overview, segments, flashcards, tips] = await Promise.all([
      generateOverview(title, description, transcript.text, AI_KEYS.OVERVIEW!),
      generateSegments(title, transcript.segments, AI_KEYS.SEGMENTS!),
      generateFlashcards(title, transcript.text, AI_KEYS.FLASHCARDS!),
      generateKeyTips(title, transcript.text, AI_KEYS.TIPS!),
    ]);

    const processingTime = Date.now() - startTime;

    console.log(`✅ AI processing completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        transcript: {
          text: transcript.text,
          segments: transcript.segments,
          duration: transcript.duration,
          language: transcript.language,
        },
        overview,
        segments,
        flashcards,
        tips,
      },
      metadata: {
        processed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
        ai_model: "gemini-1.5-flash",
        keys_used: {
          overview: !!AI_KEYS.OVERVIEW,
          segments: !!AI_KEYS.SEGMENTS,
          flashcards: !!AI_KEYS.FLASHCARDS,
          tips: !!AI_KEYS.TIPS,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error processing video:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process video",
      },
      { status: 500 }
    );
  }
}
