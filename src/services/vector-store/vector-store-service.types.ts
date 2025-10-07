// Type definitions for vector store tables
export interface VectorDocument {
  id: string;
  title: string;
  content: string;
  source_type: "pdf" | "upload" | "manual";
  source_reference?: string;
  subject_id?: string;
  module_id?: string;
  exam_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VectorChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  token_count?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SimilarChunk extends VectorChunk {
  similarity: number;
  document?: VectorDocument;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  title?: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}
