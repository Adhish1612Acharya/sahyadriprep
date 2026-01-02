export interface VectorSearchParams {
  queryEmbedding: number[];
  matchThreshold?: number;
  matchCount?: number;
  filterContentType?: string | null;
  filterCompanyIds?: string[] | null;
}
