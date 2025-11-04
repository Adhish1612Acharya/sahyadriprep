// src/app/api/rag/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/services/supabase/vector-store.service";
import generateRAGResponse from "@/helpers/generate-rag-response.helpers";
import {
  formatChunkAsSource,
  buildContextFromChunks,
  groupAndDeduplicateSources,
  type RAGSource,
} from "@/helpers/format-rag-sources.helper";
import createChunkSummary from "@/helpers/generate-chunk-summary"; // ✅ Import

/**
 * POST /api/chat
 * RAG chatbot for interview experiences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      conversation_history = [],
      search_limit = 5,
      similarity_threshold = 0.5,
    } = body;

    // ✅ Validation
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (search_limit < 1 || search_limit > 20) {
      return NextResponse.json(
        { success: false, error: "Search limit must be between 1 and 20" },
        { status: 400 }
      );
    }

    if (similarity_threshold < 0 || similarity_threshold > 1) {
      return NextResponse.json(
        { success: false, error: "Threshold must be between 0 and 1" },
        { status: 400 }
      );
    }

    console.log("💬 Processing chat message:", message);
    console.log("📊 Search parameters:", {
      search_limit,
      similarity_threshold,
    });

    const startTime = Date.now();

    // ✅ Step 1: Generate query summary ONCE
    console.log("🧠 Generating query summary...");
    let querySummary: string;

    try {
      querySummary = await createChunkSummary(message);
      console.log(
        "✅ Query summary generated:",
        querySummary.substring(0, 100) + "..."
      );
    } catch (summaryError: any) {
      console.warn(
        "⚠️ Failed to generate query summary, using original query:",
        summaryError.message
      );
      // Fallback to original message if summary generation fails
      querySummary = message;
    }

    // ✅ Step 2: Search all content types in parallel with the SAME summary
    console.log("🔍 Searching across all content types...");
    const searchStartTime = Date.now();

    const [interviewChunks, transcriptChunks, titleChunks, descriptionChunks] =
      await Promise.all([
        // ✅ CORRECT: Pass message as query, querySummary as third parameter
        vectorStoreServerOperations.searchInterviewExperiences(
          message, // ✅ Original query for logging/context
          search_limit, // ✅ Limit
          querySummary // ✅ Pre-generated summary
        ),
        vectorStoreServerOperations.searchYouTubeVideosTranscript(
          message, // ✅ Original query
          search_limit, // ✅ Limit
          querySummary // ✅ Pre-generated summary
        ),
        vectorStoreServerOperations.searchYouTubeVideosTitle(
          message, // ✅ Original query
          search_limit, // ✅ Limit
          querySummary // ✅ Pre-generated summary
        ),
        vectorStoreServerOperations.searchYouTubeVideosDescription(
          message, // ✅ Original query
          search_limit, // ✅ Limit
          querySummary // ✅ Pre-generated summary
        ),
      ]);

    // ✅ Combine all chunks and sort by similarity
    const allChunks = [
      ...interviewChunks,
      ...transcriptChunks,
      ...titleChunks,
      ...descriptionChunks,
    ].sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    console.log("All chunks : ", allChunks);

    // Filter by similarity threshold and limit
    const relevantChunks = allChunks
      .filter((chunk) => (chunk.similarity || 0) >= similarity_threshold)
      .slice(0, search_limit * 2); // Get more chunks for better context

    const searchTime = Date.now() - searchStartTime;
    console.log(`✅ Search completed in ${searchTime}ms`);
    console.log(`📊 Found ${relevantChunks.length} relevant chunks:`);
    console.log(`   - ${interviewChunks.length} from interview documents`);
    console.log(`   - ${transcriptChunks.length} from video transcripts`);
    console.log(`   - ${titleChunks.length} from video titles`);
    console.log(`   - ${descriptionChunks.length} from video descriptions`);

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "I couldn't find any relevant information in the database to answer your question. Please try rephrasing or asking about a different topic.",
        metadata: {
          context_used: false,
          relevant_chunks_count: 0,
          sources: [],
          performance: {
            search_time_ms: searchTime,
            total_time_ms: Date.now() - startTime,
          },
        },
      });
    }

    // ✅ Step 3: Build context for LLM
    const context = buildContextFromChunks(relevantChunks);
    console.log("📝 Context built:", {
      length: context.length,
      chunks: relevantChunks.length,
    });

    // ✅ Step 4: Format sources for response
    const sources: RAGSource[] = relevantChunks.map(formatChunkAsSource);

    console.log("🔖 Sources formatted:", sources.length);
    console.log("Sources : ", sources);

    const groupedSources = groupAndDeduplicateSources(sources);

    console.log("Deduplicated sources:", groupedSources);

    console.log("📚 Sources grouped:", {
      interview_documents: groupedSources.interview_documents.length,
      youtube_videos: groupedSources.youtube_videos.length,
      youtube_timestamps: groupedSources.youtube_timestamps.length,
    });

    // ✅ Step 5: Generate AI response
    const responseStartTime = Date.now();
    const response = await generateRAGResponse(
      message,
      context,
      relevantChunks,
      conversation_history
    );
    const responseTime = Date.now() - responseStartTime;

    console.log(`🤖 AI response generated in ${responseTime}ms`);

    const totalTime = Date.now() - startTime;

    // ✅ Step 6: Return structured response
    return NextResponse.json({
      success: true,
      message: response.content,
      sources: {
        interview_documents: groupedSources.interview_documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          student_name: doc.student_name,
          company: doc.company,
          batch: doc.batch,
          similarity: Math.round(doc.similarity * 1000) / 1000,
          excerpt: doc.excerpt,
          document_url: doc.document_url,
          has_video_preview: doc.has_video_preview,
        })),
        youtube_videos: groupedSources.youtube_videos.map((video) => ({
          id: video.id,
          title: video.title,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          company: video.company,
          similarity: Math.round(video.similarity * 1000) / 1000,
          content_section: video.content_section,
          excerpt: video.excerpt,
        })),
        youtube_timestamps: groupedSources.youtube_timestamps.map((ts) => ({
          id: ts.id,
          video_title: ts.title,
          video_url: ts.video_url,
          timestamp_url: ts.timestamp_url,
          start_timestamp: ts.start_timestamp,
          end_timestamp: ts.end_timestamp,
          duration_seconds: ts.duration_seconds,
          company: ts.company,
          similarity: Math.round(ts.similarity * 1000) / 1000,
          excerpt: ts.excerpt,
        })),
      },
      metadata: {
        context_used: true,
        relevant_chunks_count: relevantChunks.length,
        sources_breakdown: {
          interview_documents: groupedSources.interview_documents.length,
          youtube_videos: groupedSources.youtube_videos.length,
          youtube_timestamps: groupedSources.youtube_timestamps.length,
          total_unique_sources:
            groupedSources.interview_documents.length +
            groupedSources.youtube_videos.length +
            groupedSources.youtube_timestamps.length,
        },
        performance: {
          search_time_ms: searchTime,
          response_time_ms: responseTime,
          total_time_ms: totalTime,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error in chat:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Chat processing failed",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve chat sessions
// export async function GET(request: NextRequest) {
//   try {
//     const url = new URL(request.url);
//     const session_id = url.searchParams.get("session_id");
//     const user_id = url.searchParams.get("user_id");

//     if (session_id) {
//       // Get specific chat session with messages
//       const [sessionResult, messagesResult] = await Promise.all([
//         vectorStoreServerOperations.vectorStoreServer
//           .from("chat_sessions")
//           .select("*")
//           .eq("id", session_id)
//           .single(),
//         vectorStoreServerOperations.vectorStoreServer
//           .from("chat_messages")
//           .select("*")
//           .eq("session_id", session_id)
//           .order("created_at", { ascending: true }),
//       ]);

//       if (sessionResult.error) throw sessionResult.error;
//       if (messagesResult.error) throw messagesResult.error;

//       return NextResponse.json({
//         success: true,
//         session: sessionResult.data,
//         messages: messagesResult.data,
//       });
//     } else if (user_id) {
//       // Get all sessions for a user
//       const { data, error } =
//         await vectorStoreServerOperations.vectorStoreServer
//           .from("chat_sessions")
//           .select("*")
//           .eq("user_id", user_id)
//           .order("updated_at", { ascending: false });

//       if (error) throw error;

//       return NextResponse.json({
//         success: true,
//         sessions: data,
//       });
//     } else {
//       // Get recent public sessions or general info
//       const stats = await vectorStoreServerOperations.getDocumentStats();

//       return NextResponse.json({
//         success: true,
//         message: "Chat endpoint is ready",
//         stats,
//       });
//     }
//   } catch (error: any) {
//     console.error("❌ Error in chat GET:", error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
