import { fetchYouTubeTranscript } from "@/helpers/youtube/youtube-video.helpers";
import { AI_KEYS, validateAIKeys } from "@/config/ai-keys.config";
import {
  generateOverview,
  generateSegments,
  generateFlashcards,
  generateKeyTips,
} from "@/helpers/ai/ai-generation.helpers";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Validate API keys on startup
validateAIKeys();

/**
 * POST /api/interview-experiences/youtube-videos/:id/process
 * Process video with AI to generate all features and save to DB
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

    // Initialize Supabase client
    const supabase = await createClient();

    // Verify video exists
    const { data: videoData, error: videoError } = await supabase
      .from("youtube_videos")
      .select("*")
      .eq("id", id)
      .single();

    if (videoError || !videoData) {
      console.error("❌ Video not found:", videoError);
      return NextResponse.json(
        { success: false, error: "Video not found in database" },
        { status: 404 }
      );
    }

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

    // ============================================
    // Save AI-generated content to database
    // ============================================
    console.log("💾 Saving AI-generated content to database...");

    // 1) Upsert overview into youtube_video_overviews
    try {
      const overviewRecord = {
        youtube_video_id: id,
        summary: overview.summary,
        key_points: overview.key_points || [],
        topics: overview.topics || [],
        difficulty_level: overview.difficulty_level || "intermediate",
        recommended_for: overview.recommended_for || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("youtube_video_overviews")
        .delete()
        .eq("youtube_video_id", id);

      const { error: overviewError } = await supabase
        .from("youtube_video_overviews")
        .insert(overviewRecord);

      if (overviewError) {
        console.error("❌ Error saving overview:", overviewError);
      } else {
        console.log("✅ Overview saved/updated");
      }
    } catch (e) {
      console.error("❌ Exception saving overview:", e);
    }

    // 2) Save segments (delete existing, insert new)
    try {
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

        await supabase
          .from("youtube_video_segments")
          .delete()
          .eq("youtube_video_id", id);

        const { error: segmentsError } = await supabase
          .from("youtube_video_segments")
          .insert(segmentsToInsert);

        if (segmentsError) {
          console.error("❌ Error saving segments:", segmentsError);
        } else {
          console.log(`✅ Saved ${segmentsToInsert.length} segments`);
        }
      }
    } catch (e) {
      console.error("❌ Exception saving segments:", e);
    }

    // 3) Save flashcards (delete existing, insert new)
    try {
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

        await supabase
          .from("youtube_video_flashcards")
          .delete()
          .eq("youtube_video_id", id);

        const { error: flashcardsError } = await supabase
          .from("youtube_video_flashcards")
          .insert(flashcardsToInsert);

        if (flashcardsError) {
          console.error("❌ Error saving flashcards:", flashcardsError);
        } else {
          console.log(`✅ Saved ${flashcardsToInsert.length} flashcards`);
        }
      }
    } catch (e) {
      console.error("❌ Exception saving flashcards:", e);
    }

    // 4) Save tips (delete existing, insert new)
    try {
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

        await supabase
          .from("youtube_video_tips")
          .delete()
          .eq("youtube_video_id", id);

        const { error: tipsError } = await supabase
          .from("youtube_video_tips")
          .insert(tipsToInsert);

        if (tipsError) {
          console.error("❌ Error saving tips:", tipsError);
        } else {
          console.log(`✅ Saved ${tipsToInsert.length} tips`);
        }
      }
    } catch (e) {
      console.error("❌ Exception saving tips:", e);
    }

    // 5) Update youtube_videos: increment ai_process_count, set ai_process_done and metadata
    try {
      const aiMeta = {
        last_processed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
        ai_model: "gemini-1.5-flash-latest",
        keys_used: {
          overview: !!AI_KEYS.OVERVIEW,
          segments: !!AI_KEYS.SEGMENTS,
          flashcards: !!AI_KEYS.FLASHCARDS,
          tips: !!AI_KEYS.TIPS,
        },
        counts: {
          segments: Array.isArray(segments) ? segments.length : 0,
          flashcards: Array.isArray(flashcards) ? flashcards.length : 0,
          tips: Array.isArray(tips) ? tips.length : 0,
        },
      };

      const newCount = (videoData.ai_process_count || 0) + 1;

      const { error: updateProcessError } = await supabase
        .from("youtube_videos")
        .update({
          ai_process_done: true,
          ai_process_count: newCount,
          ai_process_metadata: aiMeta,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateProcessError) {
        console.error(
          "❌ Failed to update ai process tracking on video:",
          updateProcessError
        );
      } else {
        console.log("✅ Updated youtube_videos AI process fields");
      }
    } catch (e) {
      console.error("❌ Exception updating youtube_videos AI fields:", e);
    }

    // ============================================
    // Return response with saved data
    // ============================================
    return NextResponse.json({
      success: true,
      message: "Video processed and AI content saved successfully",
      data: {
        video_id: id,
        transcript: {
          text: transcript.text,
          segments_count: transcript.segments.length,
          duration: transcript.duration,
          language: transcript.language,
        },
        overview,
        segments: {
          count: Array.isArray(segments) ? segments.length : 0,
          data: segments,
        },
        flashcards: {
          count: Array.isArray(flashcards) ? flashcards.length : 0,
          data: flashcards,
        },
        tips: {
          count: Array.isArray(tips) ? tips.length : 0,
          data: tips,
        },
      },
      metadata: {
        processed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
        ai_model: "gemini-1.5-flash-latest",
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
