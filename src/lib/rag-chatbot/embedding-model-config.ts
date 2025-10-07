import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.NEXT_PUBLIC_HF_API_KEY, // Defaults to process.env.HUGGINGFACEHUB_API_KEY
  model: process.env.NEXT_PUBLIC_HF_MODEL_NAME, // Defaults to `BAAI/bge-base-en-v1.5` if not provided
  //provider: process.env.NEXT_PUBLIC_HF_PROVIDER, // Falls back to auto selection mechanism within Hugging Face's inference API if not provided
});

export default embeddings;
