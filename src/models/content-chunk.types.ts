import { CHUNKS_CONTENT_TYPES } from "@/constants/chunks-content-types.constants";

export type ContentType =
  (typeof CHUNKS_CONTENT_TYPES)[keyof typeof CHUNKS_CONTENT_TYPES];

export interface ContentChunk {
  id: string;
  content: string;
  content_type: ContentType;
  embedding: number[] | null;
  chunk_index: number;
  token_count: number | null;
  metadata: {
    total_document_chunks_count: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string | null;
}
