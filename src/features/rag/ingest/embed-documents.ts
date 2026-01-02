import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { EmbeddingResult } from "./types";

export async function embedDocumentsWithHandling<T extends string | string[]>(
  embeddings: HuggingFaceInferenceEmbeddings,
  documentChunks: T
): Promise<EmbeddingResult<T>> {
  const chunksArray: string[] = Array.isArray(documentChunks)
    ? documentChunks.flat()
    : [documentChunks];

  const embeddingsArray = await embeddings.embedDocuments(chunksArray);

  return Array.isArray(documentChunks)
    ? (embeddingsArray as EmbeddingResult<T>)
    : (embeddingsArray[0] as EmbeddingResult<T>);
}
