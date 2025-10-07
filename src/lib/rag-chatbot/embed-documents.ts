import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

async function embedDocumentsWithHandling(
  embeddings: HuggingFaceInferenceEmbeddings,
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
