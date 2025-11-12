import { callGemini } from "@/lib/gemini/gemini";

/**
 * Generate a summary for a text chunk using Gemini API
 * Note: Retry logic is handled by the batch processing wrapper
 *
 * @param text - Text chunk to summarize
 * @returns Summary string or fallback summary
 */
const createChunkSummary = async (text: string): Promise<string> => {
  const input = text.length > 8000 ? text.slice(0, 8000) : text;

  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_CHUNK_SUMMARY_GENERATE;
    if (!apiKey) {
      throw new Error(
        "NEXT_PUBLIC_GEMINI_API_CHUNK_SUMMARY_GENERATE is not set"
      );
    }

    const prompt = `You are creating a summary for a text chunk in a Retrieval-Augmented Generation (RAG) system. This summary will be used to help retrieve relevant information when users ask questions.

Your task:
1. Summarize the key topics, concepts, and information in this text chunk
2. Include important keywords and entities that would help match user queries
3. Focus on what questions this chunk could answer
4. Keep it 2-3 clear and concise sentences
5. Do not include introductory phrases like "This text discusses..." or "The summary is..."

Text chunk:
${input}

Return your response in the following JSON format:
{
  "summary": "Your 2-3 sentence summary here"
}`;

    // ✅ Use callGemini for JSON response
    const response = await callGemini(prompt, apiKey);

    console.log("Gemini Response:", response);

    // ✅ Extract summary from JSON response
    let summary = "";

    if (typeof response === "object" && response !== null) {
      summary = response.summary || response.text || "";
    } else if (typeof response === "string") {
      summary = response;
    }

    // ✅ Ensure it's a string
    summary = String(summary).trim();

    // ✅ Clean up the response
    summary = summary
      .replace(/^Summary:\s*/i, "")
      .replace(/^Summary for RAG retrieval:\s*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    // ✅ Validate summary
    if (!summary || summary.length < 50) {
      throw new Error(`Invalid summary: too short (${summary.length} chars)`);
    }

    return summary;
  } catch (err: any) {
    // Log error and throw to let batch processor handle retry
    console.error("❌ Error generating summary:", err.message);
    throw err; // ✅ Throw to let batch processor retry
  }
};

/**
 * Generate a fallback summary by extracting first sentences
 * Used when Gemini API fails after all retries
 *
 * @param text - Text to summarize
 * @returns Fallback summary
 */
export function createFallbackSummary(text: string): string {
  const input = text.length > 8000 ? text.slice(0, 8000) : text;

  // Extract first few sentences
  const sentences = input.match(/[^.!?]+[.!?]+/g) || [];
  const fallbackSummary = sentences.slice(0, 2).join(" ").trim();

  return (
    fallbackSummary ||
    input.trim().slice(0, 300) + (input.length > 300 ? "…" : "")
  );
}

export default createChunkSummary;
