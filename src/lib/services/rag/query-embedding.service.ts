import { EmbeddingResult } from "@/features/rag/ingest";
import { embedDocumentsWithHandling } from "@/features/rag/ingest/embed-documents";
import { embeddings } from "@/integrations/hf";

export async function generateQueryEmbedding<T extends string | string[]>(
  query: T
): Promise<EmbeddingResult<T>> {
  const queryEmbedding = await embedDocumentsWithHandling(embeddings, query);
  return queryEmbedding;
}
