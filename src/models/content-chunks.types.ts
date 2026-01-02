export interface ContentChunk {
  id: string;
  content: string;
  embedding: number[] | null;
  chunkIndex: number;
  tokenCount: number | null;
  metadata: Record<string, any>;
  createdAt: string | null;
  contentType: string;
  updatedAt: string | null;
  summary: string;
}
