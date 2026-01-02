import type { SupabaseClient } from "@supabase/supabase-js";
import { preprocessRAGQuery } from "./query-preprocessor.service";
import { performParallelSimilaritySearch } from "./vector-search.service";
import { buildRAGContextAndSources } from "./context-builder.service";
import { generateRAGResponseService } from "./rag-response.service";
import {
  formatRAGSourceAsInterview,
  formatRAGSourceAsYouTubeTimestamp,
  formatRAGSourceAsYouTubeVideo,
} from "@/helpers/formatting";
import { RAGResponse } from "./types";

export async function processRAGQuery(
  supabase: SupabaseClient,
  message: string,
  searchLimit?: number
): Promise<RAGResponse> {
  console.log("🧠 RAG orchestration started:", {
    message: message.slice(0, 50),
  });
  const startTime = Date.now();

  // Step 1-2: Preprocess (company filter + query summary)
  const { companyIds, querySummary } = await preprocessRAGQuery(
    supabase,
    message
  );

  // Step 3: Parallel vector search
  const relevantChunks = await performParallelSimilaritySearch(
    supabase,
    querySummary,
    searchLimit,
    companyIds
  );

  // Early return: No relevant results
  if (relevantChunks.length === 0) {
    const searchTime = Date.now() - startTime;
    return {
      success: true,
      message:
        companyIds.length === 0
          ? "I couldn't find any relevant information about the mentioned companies in the database."
          : "I couldn't find any relevant information in the database to answer your question.",
      sources: {
        interviewDocuments: [],
        youtubeVideos: [],
        youtubeTimestamps: [],
      },
      metadata: {
        contextUsed: false,
        relevantChunkCount: 0,
        companiesFiltered: companyIds.length,
        sourcesBreakdown: {
          interviewDocuments: 0,
          youtubeVideos: 0,
          youtubeTimestamps: 0,
          totalUniqueSources: 0,
        },
        performance: {
          searchTimeMs: searchTime,
          responseTimeMs: 0,
          totalTimeMs: searchTime,
        },
      },
    };
  }

  const searchTime = Date.now() - startTime;

  // Step 4: Build context and sources
  const { context, groupedSources } = buildRAGContextAndSources(relevantChunks);

  // Step 5: AI response generation
  const responseStartTime = Date.now();
  const { message: aiResponse, responseTime } =
    await generateRAGResponseService({
      message,
      context,
      relevantChunkCount: relevantChunks.length,
      companiesFiltered: companyIds.length,
      searchTime,
      responseStartTime,
    });

  const totalTime = Date.now() - startTime;

  return {
    success: true,
    message: aiResponse,
    sources: {
      interviewDocuments:
        groupedSources.interviewDocuments?.map(formatRAGSourceAsInterview) ??
        [],
      youtubeVideos:
        groupedSources.youtubeVideos?.map(formatRAGSourceAsYouTubeVideo) ?? [],
      youtubeTimestamps:
        groupedSources.youtubeTimestamps?.map(
          formatRAGSourceAsYouTubeTimestamp
        ) ?? [],
    },
    metadata: {
      contextUsed: true,
      relevantChunkCount: relevantChunks.length,
      companiesFiltered: companyIds.length,
      sourcesBreakdown: {
        interviewDocuments: groupedSources.interviewDocuments?.length ?? 0,
        youtubeVideos: groupedSources.youtubeVideos?.length ?? 0,
        youtubeTimestamps: groupedSources.youtubeTimestamps?.length ?? 0,
        totalUniqueSources:
          (groupedSources.interviewDocuments?.length ?? 0) +
          (groupedSources.youtubeVideos?.length ?? 0) +
          (groupedSources.youtubeTimestamps?.length ?? 0),
      },
      performance: {
        searchTimeMs: searchTime,
        responseTimeMs: responseTime,
        totalTimeMs: totalTime,
      },
    },
  };
}
