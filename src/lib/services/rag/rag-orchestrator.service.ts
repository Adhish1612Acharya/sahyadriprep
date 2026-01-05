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
import {
  create_doc_chunk,
  doc_loader,
  embedDocumentsWithHandling,
} from "@/features/rag/ingest";
import { generateSummariesInBatches } from "@/features/rag/batch";
import { embeddings } from "@/integrations/hf";
import {
  ContentChunkCreateInput,
  insertInterviewExperienceContentChunks,
} from "@/lib/repositories/vector-store";
import { InterviewUploadData } from "../interview-experiences";
import { handleSupabaseResult } from "@/helpers/supabase";
import { ContentChunk } from "@/models";

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

export async function processInterviewExperiencePdfToChunks(
  vectorSupabase: SupabaseClient,
  tempFilePath: string,
  experienceId: string,
  mediaId: string,
  videoMediaId: string | null,
  documentMediaFileTitle: string,
  validatedData: InterviewUploadData,
  collegeId: string
): Promise<ContentChunk[]> {
  // 1. Load & chunk
  console.log("📖 Loading PDF...");
  const documentContent = await doc_loader(tempFilePath);

  console.log("✂️ Chunking...");
  const chunks = await create_doc_chunk(documentContent);

  // 2. Batch summaries
  console.log("🧠 Generating summaries...");
  const summaries = await generateSummariesInBatches(chunks, {
    batchSize: 5,
    delayBetweenBatches: 7000,
    maxRetries: 2,
  });

  // 3. Embeddings
  console.log("🧠 Generating embeddings...");
  const summaryEmbeddings = await embedDocumentsWithHandling(
    embeddings,
    summaries
  );

  // 4. Chunk objects → insert
  const chunksToInsert: ContentChunkCreateInput[] = chunks.map(
    (chunk, index) => ({
      content: chunk,
      summary: summaries[index],
      content_type: "interview_experience",
      embedding: summaryEmbeddings[index],
      chunk_index: index,
      token_count: chunk.split(" ").length,
      metadata: {
        total_document_chunks_count: chunks.length,
        interview_experience_id: experienceId,
        document_media_id: mediaId,
        document_title: documentMediaFileTitle,
        student_name: validatedData.studentName,
        company_id: validatedData.companyId,
        college_id: collegeId,
        batch: validatedData.batch,
        has_video_preview: !!videoMediaId,
      },
    })
  );

  // 5. Index (repo)
  const { data, error } = await insertInterviewExperienceContentChunks(
    vectorSupabase,
    chunksToInsert
  );
  const ragContentChunk = handleSupabaseResult<ContentChunk[] | null>(
    { data, error },
    "lenient",
    "Interview_experienec_rag_chunk",
    { experienceId: experienceId }
  );

  return ragContentChunk || [];
}
