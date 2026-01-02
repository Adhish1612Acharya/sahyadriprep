import { searchVectorContent } from "@/lib/repositories/vector-store";
import { ContentChunk } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { VectorSearchParams } from "./types";
import { handleSupabaseResult } from "@/helpers/supabase";
import { CHUNKS_CONTENT_TYPES } from "@/constants";
import { generateQueryEmbedding } from "./query-embedding.service";

export async function searchVectorContentService(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  options: {
    contentType?: string;
    threshold?: number;
    limit?: number;
    companyIds?: string[];
  } = {}
): Promise<ContentChunk[]> {
  const params: VectorSearchParams = {
    queryEmbedding,
    matchThreshold: options.threshold || 0.5,
    matchCount: options.limit || 10,
    filterContentType: options.contentType || null,
    filterCompanyIds: options.companyIds || null,
  };

  const { data, error } = await searchVectorContent(supabase, params);

  const chunks = handleSupabaseResult<ContentChunk[] | null>(
    { data, error },
    "lenient",
    "Vector search",
    "vector search error"
  );

  return chunks || [];
}

// Interview Experience Similarity Search
export async function searchInterviewExperiencesSimilarity(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  options: { threshold?: number; limit?: number; companyIds?: string[] } = {}
): Promise<ContentChunk[]> {
  console.log("🎤 Interview similarity search:", {
    threshold: options.threshold || 0.55,
    limit: options.limit || 5,
  });

  return searchVectorContentService(supabase, queryEmbedding, {
    contentType: CHUNKS_CONTENT_TYPES.INTERVIEW_EXPERIENCE,
    threshold: options.threshold || 0.55,
    limit: options.limit || 5,
    companyIds: options.companyIds,
  });
}

// YouTube Transcript Similarity Search
export async function searchYouTubeTranscriptsSimilarity(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  options: { threshold?: number; limit?: number; companyIds?: string[] } = {}
): Promise<ContentChunk[]> {
  return searchVectorContentService(supabase, queryEmbedding, {
    contentType: CHUNKS_CONTENT_TYPES.YOUTUBE_VIDEO_TRANSCRIPT,
    threshold: options.threshold || 0.45,
    limit: options.limit || 8,
    companyIds: options.companyIds,
  });
}

// YouTube Title Similarity Search
export async function searchYouTubeTitlesSimilarity(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  options: { threshold?: number; limit?: number; companyIds?: string[] } = {}
): Promise<ContentChunk[]> {
  return searchVectorContentService(supabase, queryEmbedding, {
    contentType: CHUNKS_CONTENT_TYPES.YOUTUBE_VIDEO_TITLE,
    threshold: options.threshold || 0.65,
    limit: options.limit || 3,
    companyIds: options.companyIds,
  });
}

// YouTube Description Similarity Search
export async function searchYouTubeDescriptionsSimilarity(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  options: { threshold?: number; limit?: number; companyIds?: string[] } = {}
): Promise<ContentChunk[]> {
  return searchVectorContentService(supabase, queryEmbedding, {
    contentType: CHUNKS_CONTENT_TYPES.YOUTUBE_VIDEO_DESCRIPTION,
    threshold: options.threshold || 0.5,
    limit: options.limit || 4,
    companyIds: options.companyIds,
  });
}

// Main Parallel Orchestrator
export async function performParallelSimilaritySearch(
  supabase: SupabaseClient,
  querySummary: string,
  searchLimit: number = 5,
  companyIds?: string[]
): Promise<ContentChunk[]> {
  console.log(" Starting parallel similarity search...");

  const queryEmbedding = await generateQueryEmbedding(querySummary);

  const [interviewChunks, transcriptChunks, titleChunks, descriptionChunks] =
    await Promise.all([
      searchInterviewExperiencesSimilarity(supabase, queryEmbedding, {
        limit: searchLimit,
        companyIds,
      }),
      searchYouTubeTranscriptsSimilarity(supabase, queryEmbedding, {
        limit: searchLimit,
        companyIds,
      }),
      searchYouTubeTitlesSimilarity(supabase, queryEmbedding, {
        limit: Math.floor(searchLimit / 2),
        companyIds,
      }),
      searchYouTubeDescriptionsSimilarity(supabase, queryEmbedding, {
        limit: Math.floor(searchLimit / 2),
        companyIds,
      }),
    ]);

  const allChunks = [
    ...interviewChunks,
    ...transcriptChunks,
    ...titleChunks,
    ...descriptionChunks,
  ];

  // Sort by similarity (assumes metadata.similarity exists)
  return allChunks
    .sort(
      (a, b) => (b.metadata?.similarity || 0) - (a.metadata?.similarity || 0)
    )
    .slice(0, searchLimit * 3); // Top results
}
