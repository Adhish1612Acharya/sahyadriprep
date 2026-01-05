export interface VectorSearchParams {
  queryEmbedding: number[];
  matchThreshold?: number;
  matchCount?: number;
  filterContentType?: string | null;
  filterCompanyIds?: string[] | null;
}

export interface ContentChunkCreateInput {
  content: string;
  summary: string;
  content_type: string;
  embedding: number[]; 
  chunk_index: number;
  token_count: number;
  metadata: Record<string, any>; 
}
