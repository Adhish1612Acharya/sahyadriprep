/**
 * Chat message type
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  search_limit?: number;
  similarity_threshold?: number;
}

/**
 * Chat response
 */
export interface ChatResponse {
  success: boolean;
  message: string;
  metadata: {
    context_used: boolean;
    relevant_chunks_count: number;
    sources: Array<{
      content_type: string;
      similarity: number;
      company: string;
      student: string;
      batch: string;
      preview: string;
    }>;
    performance: {
      search_time_ms: number;
      response_time_ms: number;
      total_time_ms: number;
    };
  };
}
