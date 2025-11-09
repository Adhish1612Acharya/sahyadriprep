// src/app/api/rag/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/services/supabase/vector-store.service";

// ✅ Clean, organized imports
import { generateRAGResponse, createChunkSummary } from "@/helpers/ai";
import { processCompanyFilter } from "@/helpers/rag";
import {
  formatChunkAsSource,
  buildContextFromChunks,
  groupAndDeduplicateSources,
  type RAGSource,
} from "@/helpers/formatting";

/**
 * POST /api/rag/chat
 * RAG chatbot for interview experiences with company filtering
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

    const startTime = Date.now();

    // ✅ Step 1: Process company filter (extract + fetch IDs)
    const companyIds = await processCompanyFilter(message);

    console.log("Companies ids : ", companyIds);

    // ✅ Step 2: Generate query summary
    console.log("🧠 Generating query summary...");
    let querySummary: string;

    try {
      querySummary = await createChunkSummary(message);
      console.log("✅ Query summary generated");
    } catch (summaryError: any) {
      console.warn("⚠️ Failed to generate query summary, using original query");
      querySummary = message;
    }

    console.log("Query Summary: ", querySummary);

    // ✅ Step 3: Search with company filter
    console.log("🔍 Searching across all content types...");
    if (companyIds.length > 0) {
      console.log(`🎯 Filtering by ${companyIds.length} companies`);
    }

    const searchStartTime = Date.now();

    const [interviewChunks, transcriptChunks, titleChunks, descriptionChunks] =
      await Promise.all([
        vectorStoreServerOperations.searchInterviewExperiences(
          message,
          search_limit,
          querySummary,
          companyIds.length > 0 ? companyIds : undefined
        ),
        vectorStoreServerOperations.searchYouTubeVideosTranscript(
          message,
          search_limit,
          querySummary,
          companyIds.length > 0 ? companyIds : undefined
        ),
        vectorStoreServerOperations.searchYouTubeVideosTitle(
          message,
          search_limit,
          querySummary,
          companyIds.length > 0 ? companyIds : undefined
        ),
        vectorStoreServerOperations.searchYouTubeVideosDescription(
          message,
          search_limit,
          querySummary,
          companyIds.length > 0 ? companyIds : undefined
        ),
      ]);

    const allChunks = [
      ...interviewChunks,
      ...transcriptChunks,
      ...titleChunks,
      ...descriptionChunks,
    ].sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    console.log(
      `🔎 Retrieved ${allChunks.length} total chunks from vector store`,
      allChunks
    );

    const relevantChunks = allChunks
      .filter((chunk) => (chunk.similarity || 0) >= similarity_threshold)
      .slice(0, search_limit * 2);

    const searchTime = Date.now() - searchStartTime;
    console.log(`✅ Search completed in ${searchTime}ms`);

    if (relevantChunks.length === 0) {
      const noResultsMessage =
        companyIds.length > 0
          ? `I couldn't find any relevant information about the mentioned companies in the database.`
          : "I couldn't find any relevant information in the database to answer your question.";

      return NextResponse.json({
        success: true,
        message: noResultsMessage,
        metadata: {
          context_used: false,
          relevant_chunks_count: 0,
          companies_filtered: companyIds.length,
          sources: [],
          performance: {
            search_time_ms: searchTime,
            total_time_ms: Date.now() - startTime,
          },
        },
      });
    }

    // ✅ Step 4: Build context and format sources
    const context = buildContextFromChunks(relevantChunks);
    const sources: RAGSource[] = relevantChunks.map(formatChunkAsSource);
    const groupedSources = groupAndDeduplicateSources(sources);

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
