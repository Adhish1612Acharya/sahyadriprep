import { ENV } from "@/config/env";
import { AI_OUTPUT_SCHEMAS } from "@/constants/ai-output-schemas";
import { AI_PROMPTS } from "@/constants/ai-prompts";
import { generateStructuredAiOutput } from "@/features/ai/structured-output";

/**
 * Generate a summary for a text chunk using Gemini API (JSON mode)
 * Note: Retry logic is handled by the batch processing wrapper
 */
export async function createChunkSummary(text: string): Promise<string> {
  const prompt = AI_PROMPTS.chunkSummary({ text });

  try {
    const apiKey = ENV.GEMINI_API_CHUNK_SUMMARY_GENERATE;

    const { summary } = await generateStructuredAiOutput<{ summary: string }>(
      prompt,
      apiKey,
      AI_OUTPUT_SCHEMAS.chunkSummary
    );

    let cleaned = String(summary || "").trim();

    // Light cleanup if model still adds prefixes
    cleaned = cleaned
      .replace(/^Summary:\s*/i, "")
      .replace(/^Summary for RAG retrieval:\s*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (!cleaned || cleaned.length < 50) {
      throw new Error(`Invalid summary: too short (${cleaned.length} chars)`);
    }

    return cleaned;
  } catch (err: any) {
    console.error("❌ Error generating summary:", err.message);
    throw err; // let batch processor handle retry
  }
}

export default createChunkSummary;
