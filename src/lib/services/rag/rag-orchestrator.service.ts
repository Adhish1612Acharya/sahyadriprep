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
import { ContentChunkCreateInput } from "@/lib/repositories/vector-store";
import { InterviewUploadData } from "../interview-experiences";
import { ContentChunk } from "@/models";
import { insertInterviewExperienceContentChunksService } from "../vector-store";
import { chunkTranscriptByTokens, formatTimestamp } from "@/helpers/youtube";
import { createChunkSummarySafe } from "@/features/rag";
import { TranscriptSegment } from "@/features/youtube";

export async function processRAGQuery(
  supabase: SupabaseClient,
  message: string,
  searchLimit?: number,
): Promise<RAGResponse> {
  console.log("🧠 RAG orchestration started:", {
    message: message.slice(0, 50),
  });
  const startTime = Date.now();


  // Step 1-2: Preprocess (company filter + query summary)
  const { companyIds, querySummary } = await preprocessRAGQuery(
    supabase,
    message,
  );

  // Step 3: Parallel vector search
  const relevantChunks = await performParallelSimilaritySearch(
    supabase,
    querySummary,
    searchLimit,
    companyIds,
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
          formatRAGSourceAsYouTubeTimestamp,
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
  collegeId: string,
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
    summaries,
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
    }),
  );

  // 5. Index (repo)
  const ragContentChunk = await insertInterviewExperienceContentChunksService(
    vectorSupabase,
    chunksToInsert,
  );

  return ragContentChunk || [];
}

export async function processInterviewSessionToChunks(
  vectorSupabase: SupabaseClient,
  InterviewSessionData: {
    title: string;
    description: string;
    transcriptSegments: TranscriptSegment[];
    videoId: string;
    videoUrl: string;
    companyId: string;
    collegeId: string;
    sessionId: string;
    createdBy: string;
  },
): Promise<ContentChunk[]> {
  // 1. Smart chunking by token count (200-300 words per chunk)
  const transcriptChunks = chunkTranscriptByTokens(
    InterviewSessionData.transcriptSegments,
    200,
    300,
  );

  // 2. Summaries for title and description
  const titleSummary =
    InterviewSessionData.title.length > 200
      ? await createChunkSummarySafe(InterviewSessionData.title)
      : InterviewSessionData.title;

  let descriptionSummary =
    InterviewSessionData.description || "No description available";
  if (
    InterviewSessionData.description &&
    InterviewSessionData.description.length > 500
  ) {
    descriptionSummary = await createChunkSummarySafe(
      InterviewSessionData.description,
    );
  }

  // 3. Summaries for transcript chunks
  const transcriptTexts = transcriptChunks.map((chunk) => chunk.text);
  const transcriptSummaries = await generateSummariesInBatches(
    transcriptTexts,
    {
      batchSize: 5,
      delayBetweenBatches: 7000,
      delayBetweenRequests: 500,
      maxRetries: 2,
    },
  );

  // 4. Embeddings for all content
  const allSummaries = [
    titleSummary,
    descriptionSummary,
    ...transcriptSummaries,
  ];
  const allEmbeddings = await embedDocumentsWithHandling(
    embeddings,
    allSummaries,
  );

  // 5. Prepare chunks for insertion
  const chunksToInsert: ContentChunkCreateInput[] = [];

  // Title chunk
  chunksToInsert.push({
    content: InterviewSessionData.title,
    summary: titleSummary,
    content_type: "youtube_video_title",
    embedding: allEmbeddings[0],
    chunk_index: 0,
    token_count: InterviewSessionData.title.split(" ").length,
    metadata: {
      youtube_video_id: InterviewSessionData.sessionId, //Both ids are same for now
      video_id: InterviewSessionData.videoId,
      video_url: InterviewSessionData.videoUrl,
      video_title: InterviewSessionData.title,
      company_id: InterviewSessionData.companyId,
      college_id: InterviewSessionData.collegeId,
      content_section: "title",
      total_video_chunks: transcriptChunks.length + 2,
      summary_length: titleSummary.length,
      content_length: InterviewSessionData.title.length,
    },
  });

  // Description chunk
  chunksToInsert.push({
    content: InterviewSessionData.description || "No description available",
    summary: descriptionSummary,
    content_type: "youtube_video_description",
    embedding: allEmbeddings[1],
    chunk_index: 1,
    token_count: (InterviewSessionData.description || "").split(" ").length,
    metadata: {
      youtube_video_id: InterviewSessionData.sessionId, //Both ids are same for now
      video_id: InterviewSessionData.videoId,
      video_url: InterviewSessionData.videoUrl,
      video_title: InterviewSessionData.title,
      company_id: InterviewSessionData.companyId,
      college_id: InterviewSessionData.collegeId,
      content_section: "description",
      total_video_chunks: transcriptChunks.length + 2,
      summary_length: descriptionSummary.length,
      content_length: (InterviewSessionData.description || "").length,
    },
  });

  // Transcript chunks
  transcriptChunks.forEach((chunk, index) => {
    const timestampUrl = `${InterviewSessionData.videoUrl}&t=${Math.floor(
      chunk.start_time,
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
        youtube_video_id: InterviewSessionData.sessionId,
        video_id: InterviewSessionData.videoId,
        video_url: InterviewSessionData.videoUrl,
        video_title: InterviewSessionData.title,
        company_id: InterviewSessionData.companyId,
        college_id: InterviewSessionData.collegeId,

        // Precise timestamp references
        start_time: chunk.start_time,
        end_time: chunk.end_time,
        start_timestamp: formatTimestamp(chunk.start_time),
        end_timestamp: formatTimestamp(chunk.end_time),
        duration_seconds: chunk.end_time - chunk.start_time,

        // Clickable YouTube link with timestamp
        timestamp_url: timestampUrl,

        // Segment references
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

  // 6. Store all chunks in vector database using the service
  const ragContentChunk = await insertInterviewExperienceContentChunksService(
    vectorSupabase,
    chunksToInsert,
  );

  return ragContentChunk || [];
}
