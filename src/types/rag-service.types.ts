import { SourcesDisplay } from "./rag-source-display.types";

/**
 * Chat message type
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourcesDisplay; // ✅ Add sources to message
  timestamp?: Date;
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string;
  conversation_history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  search_limit?: number;
  similarity_threshold?: number;
}

/**
 * Chat response
 */
export interface ChatResponse {
  success: boolean;
  message: string;
  sources?: SourcesDisplay; // ✅ Add sources to response
  metadata?: {
    context_used: boolean;
    relevant_chunks_count: number;
    sources_breakdown: {
      interview_documents: number;
      youtube_videos: number;
      youtube_timestamps: number;
      total_unique_sources: number;
    };
    performance: {
      search_time_ms: number;
      response_time_ms: number;
      total_time_ms: number;
    };
  };
  error?: string;
}
