import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import type { Embeddings } from "@langchain/core/embeddings";
import { LocalMiniLMEmbeddings } from "./local-minilm-embeddings";

// EMBEDDINGS_PROVIDER=self runs all-MiniLM-L6-v2 in-process (transformers.js).
// Anything else, including unset, keeps the Hugging Face hosted API, so setting
// it back to `hf` is a rollback with no code change.
const provider = process.env.EMBEDDINGS_PROVIDER === "self" ? "self" : "hf";

const embeddings: Embeddings =
  provider === "self"
    ? new LocalMiniLMEmbeddings()
    : new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HF_API_KEY, // Defaults to process.env.HUGGINGFACEHUB_API_KEY
        model: process.env.NEXT_PUBLIC_HF_MODEL_NAME, // Defaults to `BAAI/bge-base-en-v1.5` if not provided
        //provider: process.env.NEXT_PUBLIC_HF_PROVIDER, // Falls back to auto selection mechanism within Hugging Face's inference API if not provided
      });

export default embeddings;
