import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as v_createclient } from "@/lib/vector_supabase/server";
import {
  chunkTranscriptByTokens,
  extractYouTubeVideoId,
  fetchYouTubeMetadata,
  fetchYouTubeTranscript,
  formatTimestamp,
} from "@/helpers/youtube-video.helpers";
import createChunkSummary from "@/helpers/generate-chunk-summary";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";
import embedDocumentsWithHandling from "@/lib/rag-chatbot/embed-documents";
import { requireAdmin, hasCollegeAccess } from "@/helpers/auth.helpers"; // ✅ Import auth helpers
import { generateSummariesInBatches } from "@/helpers/batch-summary.helpers";

/**
 * GET /api/interview-experiences/youtube-videos
 * Get all YouTube videos with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("company_id");
    const college_id = searchParams.get("college_id");

    const supabase = await createClient();

    let query = supabase
      .from("youtube_videos")
      .select(
        `
        *,
        companies:company_id(id, name, logo_url),
        colleges:college_id(id, name)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (company_id) {
      query = query.eq("company_id", company_id);
    }

    if (college_id) {
      query = query.eq("college_id", college_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Fetched videos:", data?.length || 0);

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error: any) {
    console.error("❌ Error fetching YouTube videos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch videos",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interview-experiences/youtube-videos
 * Create a new YouTube video (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Check if user is admin
    const { error: authError, user, role } = await requireAdmin();

    if (authError) {
      return authError; // Return 401 or 403 response
    }

    console.log(`🔐 Admin user authenticated: ${user!.email} (${role})`);

    // ✅ 2. Parse request body
    const body = await request.json();
    const { video_url, company_id, college_id } = body;

    // Validation
    if (!video_url || !company_id || !college_id) {
      return NextResponse.json(
        {
          success: false,
          error: "video_url, company_id, and college_id are required",
        },
        { status: 400 }
      );
    }

    // ✅ 3. Check if user has access to this college
    const hasAccess = await hasCollegeAccess(user!.id, college_id);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "You don't have permission to add videos for this college",
        },
        { status: 403 }
      );
    }

    console.log("🎬 Creating YouTube video:", video_url);

    const supabase = await createClient();
    const vectorSupabase = await v_createclient();

    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(video_url);

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid YouTube URL",
        },
        { status: 400 }
      );
    }

    // Check if video already exists
    const { data: existingVideo } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title")
      .eq("video_id", videoId)
      .single();

    if (existingVideo) {
      return NextResponse.json(
        {
          success: false,
          error: "Video already exists",
          data: existingVideo,
        },
        { status: 409 }
      );
    }

    // Fetch metadata from YouTube API
    const metadata = await fetchYouTubeMetadata(videoId);

    console.log("ℹ️ Fetched metadata for video:", metadata);

    // Clean URL
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Store in database
    const { data: video_data, error: insertError } = await supabase
      .from("youtube_videos")
      .insert({
        video_id: metadata.video_id,
        video_url: cleanUrl,
        title: metadata.title,
        description: metadata.description,
        thumbnail_url: metadata.thumbnail_url,
        duration: metadata.duration,
        company_id,
        college_id,
        created_by: user!.id, // ✅ Track who created it
      })
      .select(
        `
        *,
        companies:company_id(id, name, logo_url),
        colleges:college_id(id, name)
      `
      )
      .single();

    if (insertError) {
      throw new Error(`Failed to store video: ${insertError.message}`);
    }

    console.log("✅ YouTube video created:", video_data.id);

    // ✅ Process transcript and create embeddings
    try {
      console.log("📝 Processing transcript for embeddings...");

      // 1. Fetch transcript
      const transcriptSegments = await fetchYouTubeTranscript(videoId);

      console.log(
        "ℹ️ Fetched transcript segments:",
        transcriptSegments?.segments?.length || 0
      );

      if (!transcriptSegments || transcriptSegments.segments.length === 0) {
        console.warn("⚠️ No transcript available for this video");
      } else {
        // ✅ 2. Smart chunking by token count (200-300 words per chunk)
        const transcriptChunks = chunkTranscriptByTokens(
          transcriptSegments.segments,
          200, // Target 200 words per chunk
          300 // Max 300 words per chunk
        );

        console.log(
          `📊 Created ${transcriptChunks.length} smart chunks from ${transcriptSegments.segments.length} segments`
        );
        // ✅ 3. Process Title and Description
        console.log("📝 Processing video title and description...");

        // Generate summary for title (if needed)
        const titleSummary =
          video_data.title.length > 200
            ? await createChunkSummary(video_data.title)
            : video_data.title;

        // Generate summary for description (if needed)
        let descriptionSummary =
          video_data.description || "No description available";
        if (video_data.description && video_data.description.length > 500) {
          descriptionSummary = await createChunkSummary(video_data.description);
        }

        console.log("✅ Generated title and description summaries");

        // ✅ 4. Generate summaries for transcript chunks in batches
        console.log(
          `🧠 Generating summaries for ${transcriptChunks.length} transcript chunks...`
        );



        // ✅ NEW: Batch processing with intelligent rate limiting
        const transcriptTexts = transcriptChunks.map((chunk) => chunk.text);
        const transcriptSummaries = await generateSummariesInBatches(
          transcriptTexts,
          {
            batchSize: 5, // Process 5 chunks at a time
            delayBetweenBatches: 7000, // 7 seconds between batches
            delayBetweenRequests: 500, // 0.5 seconds within batch
            maxRetries: 2, // Retry each chunk up to 2 times
          }
        );

        console.log(
          `✅ Generated ${transcriptSummaries.length} transcript summaries`
        );

        // ✅ 5. Generate embeddings for ALL content
        const allSummaries = [
          titleSummary,
          descriptionSummary,
          ...transcriptSummaries,
        ];

        console.log(
          `🧠 Generating embeddings for ${allSummaries.length} items (1 title + 1 description + ${transcriptSummaries.length} transcript chunks)...`
        );

        const allEmbeddings = await embedDocumentsWithHandling(
          embeddings,
          allSummaries
        );

        console.log(`✅ Generated ${allEmbeddings.length} embeddings`);

        // ✅ 6. Prepare chunks for insertion with enhanced metadata
        const chunksToInsert = [];

        // Insert Title chunk
        chunksToInsert.push({
          content: video_data.title,
          summary: titleSummary,
          content_type: "youtube_video_title",
          embedding: allEmbeddings[0],
          chunk_index: 0,
          token_count: video_data.title.split(" ").length,
          metadata: {
            youtube_video_id: video_data.id,
            video_id: video_data.video_id,
            video_url: video_data.video_url,
            video_title: video_data.title,
            company_id: video_data.company_id,
            college_id: video_data.college_id,
            content_section: "title",
            total_video_chunks: transcriptChunks.length + 2,
            summary_length: titleSummary.length,
            content_length: video_data.title.length,
          },
        });

        // Insert Description chunk
        chunksToInsert.push({
          content: video_data.description || "No description available",
          summary: descriptionSummary,
          content_type: "youtube_video_description",
          embedding: allEmbeddings[1],
          chunk_index: 1,
          token_count: (video_data.description || "").split(" ").length,
          metadata: {
            youtube_video_id: video_data.id,
            video_id: video_data.video_id,
            video_url: video_data.video_url,
            video_title: video_data.title,
            company_id: video_data.company_id,
            college_id: video_data.college_id,
            content_section: "description",
            total_video_chunks: transcriptChunks.length + 2,
            summary_length: descriptionSummary.length,
            content_length: (video_data.description || "").length,
          },
        });

        // ✅ Insert Transcript chunks with enhanced metadata
        transcriptChunks.forEach((chunk, index) => {
          const timestampUrl = `${video_data.video_url}&t=${Math.floor(
            chunk.start_time
          )}s`;

          chunksToInsert.push({
            content: chunk.text,
            summary: transcriptSummaries[index],
            content_type: "youtube_video_transcript",
            embedding: allEmbeddings[index + 2],
            chunk_index: index + 2,
            token_count: chunk.word_count,
            metadata: {
              // Video identifiers
              youtube_video_id: video_data.id,
              video_id: video_data.video_id,
              video_url: video_data.video_url,
              video_title: video_data.title,
              company_id: video_data.company_id,
              college_id: video_data.college_id,

              // ✅ Precise timestamp references
              start_time: chunk.start_time,
              end_time: chunk.end_time,
              start_timestamp: formatTimestamp(chunk.start_time),
              end_timestamp: formatTimestamp(chunk.end_time),
              duration_seconds: chunk.end_time - chunk.start_time,

              // ✅ Clickable YouTube link with timestamp
              timestamp_url: timestampUrl,

              // ✅ Segment references
              segment_start: chunk.segment_start,
              segment_end: chunk.segment_end,
              segment_count: chunk.segment_count,

              // Content section info
              content_section: "transcript",
              chunk_number: index + 1,
              total_transcript_chunks: transcriptChunks.length,
              total_video_chunks: transcriptChunks.length + 2,

              // Content metrics
              word_count: chunk.word_count,
              summary_length: transcriptSummaries[index].length,
              content_length: chunk.text.length,
            },
          });
        });

        // 7. Store all chunks in vector database
        const { error: chunksError } = await vectorSupabase
          .from("content_chunks")
          .insert(chunksToInsert);

        if (chunksError) {
          console.error("❌ Error storing chunks:", chunksError.message);
        } else {
          console.log(
            `✅ Stored ${chunksToInsert.length} chunks in vector DB:`
          );
          console.log(`   - 1 title chunk`);
          console.log(`   - 1 description chunk`);
          console.log(
            `   - ${transcriptChunks.length} transcript chunks (${transcriptSegments.segments.length} original segments)`
          );
          console.log(
            `   - Average ${Math.round(
              transcriptChunks.reduce((sum, c) => sum + c.word_count, 0) /
                transcriptChunks.length
            )} words per chunk`
          );
        }
      }
    } catch (transcriptError: any) {
      console.error("⚠️ Transcript processing failed:", transcriptError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "YouTube video added successfully",
        data: video_data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error creating YouTube video:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add YouTube video",
      },
      { status: 500 }
    );
  }
}
