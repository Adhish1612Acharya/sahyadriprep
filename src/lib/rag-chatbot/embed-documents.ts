import type { Embeddings } from "@langchain/core/embeddings";

async function embedDocumentsWithHandling(
  embeddings: Embeddings,
  documentChunks: string[]
) {
  try {
    const embeddingsArray = await embeddings.embedDocuments(documentChunks);
    return embeddingsArray;
  } catch (error) {
    console.error("Error embedding documents:", error);
    throw error;
  }
}

export default embedDocumentsWithHandling;
