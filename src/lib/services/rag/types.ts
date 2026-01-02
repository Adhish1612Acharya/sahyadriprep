import {
  FormattedInterviewSource,
  FormattedYouTubeTimestampSource,
  FormattedYouTubeVideoSource,
  RAGSource,
} from "@/helpers/formatting";
import { SupabaseClient } from "@supabase/supabase-js";

export interface VectorSearchParams {
  queryEmbedding: number[];
  matchThreshold: number;
  matchCount: number;
  filterContentType: string | null;
  filterCompanyIds: string[] | null;
}

export interface QueryPreprocessResult {
  companyIds: string[];
  querySummary: string;
}

export interface GroupedSources {
  interviewDocuments: RAGSource[];
  youtubeVideos: RAGSource[];
  youtubeTimestamps: RAGSource[];
}

export interface GenerateRAGResponseParams {
  message: string;
  context: string;
  relevantChunkCount: number;
  companiesFiltered: number;
  searchTime: number;
  responseStartTime: number;
}

export interface ProcessRAGQueryParams {
  supabase: SupabaseClient;
  message: string;
  searchLimit?: number;
  similarityThreshold?: number;
}

export interface RAGResponse {
  success: true;
  message: string;
  sources: {
    interviewDocuments: FormattedInterviewSource[];
    youtubeVideos: FormattedYouTubeVideoSource[];
    youtubeTimestamps: FormattedYouTubeTimestampSource[];
  };
  metadata: {
    contextUsed: boolean;
    relevantChunkCount: number;
    companiesFiltered: number;
    sourcesBreakdown: {
      interviewDocuments: number;
      youtubeVideos: number;
      youtubeTimestamps: number;
      totalUniqueSources: number;
    };
    performance: {
      searchTimeMs: number;
      responseTimeMs: number;
      totalTimeMs: number;
    };
  };
}

export interface RAGEmptyResponse {
  success: true;
  message: string;
  metadata: {
    contextUsed: false;
    relevantChunkCount: number; // Always 0
    companiesFiltered: number;
    performance: {
      searchTimeMs: number;
      responseTimeMs: number; // Always 0
      totalTimeMs: number;
    };
  };
}
