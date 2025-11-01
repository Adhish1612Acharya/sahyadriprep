// import { InferenceClient } from "@huggingface/inference";

// const createChunkSummary = async (text: string) => {
//   const maxAttempts = 3;
//   let attempt = 0;
//   let backoff = 500;
//   const input = text.length > 8000 ? text.slice(0, 8000) : text;

//   while (attempt < maxAttempts) {
//     try {
//       const hfToken = process.env.NEXT_PUBLIC_HF_API_KEY;
//       const hfClient = new InferenceClient(hfToken);
//       const res = await hfClient.summarization({
//         model: "facebook/bart-large-cnn",
//         inputs: input,
//         // provider optional; keep hf-inference default
//         // parameters can be tuned if supported by your client/provider
//         parameters: { max_length: 150, min_length: 30, do_sample: false },
//         provider: "hf-inference",
//       });

//       // Handle different possible shapes of response
//       let summary = "";
//       if (Array.isArray(res) && res.length > 0) {
//         summary =
//           (res[0] as any).summary_text ||
//           (res[0] as any).generated_text ||
//           (res[0] as any).text ||
//           String(res[0]);
//       } else if (typeof res === "object" && res !== null) {
//         summary =
//           (res as any).summary_text ||
//           (res as any).generated_text ||
//           (res as any).text ||
//           JSON.stringify(res);
//       } else {
//         summary = String(res);
//       }

//       summary = summary.trim();
//       if (summary.length === 0) throw new Error("Empty summary returned");
//       return summary;
//     } catch (err: any) {
//       attempt += 1;
//       if (attempt >= maxAttempts) break;
//       console.warn(
//         `HF summarization attempt ${attempt} failed: ${
//           err?.message || err
//         }. retrying in ${backoff}ms`
//       );
//       await new Promise((r) => setTimeout(r, backoff));
//       backoff *= 2;
//     }
//   }

//   // Final fallback: short truncation as pseudo-summary
//   console.warn("HF summarization failed, using truncated fallback summary.");
//   return text.trim().slice(0, 300) + (text.length > 300 ? "…" : "");
// };

// export default createChunkSummary;

import { callGemini, callGeminiText } from "@/lib/gemini/gemini";

const createChunkSummary = async (text: string): Promise<string> => {
  const maxAttempts = 3;
  let attempt = 0;
  let backoff = 500;

  const input = text.length > 8000 ? text.slice(0, 8000) : text;

  while (attempt < maxAttempts) {
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

Summary for RAG retrieval:`;

      // ✅ Use callGeminiText for plain text response (not JSON)
      let summary = await callGeminiText(prompt, apiKey);

      console.log("Generated summary (type):", typeof summary);
      console.log("Generated summary (value):", summary);

      // ✅ Handle if it's accidentally JSON
      if (typeof summary === "object" && summary !== null) {
        // If it's an object with a summary property
        summary = (summary as any).summary || JSON.stringify(summary);
      }

      // ✅ Ensure it's a string
      summary = String(summary);

      // Clean up the response
      summary = summary
        .replace(/^Summary:\s*/i, "")
        .replace(/^Summary for RAG retrieval:\s*/i, "")
        .replace(/^["']|["']$/g, "")
        .trim();

      // Validate summary
      if (!summary || summary.length < 50) {
        throw new Error(`Invalid summary: too short (${summary.length} chars)`);
      }

      console.log("✅ Final cleaned summary:", summary);
      return summary;
    } catch (err: any) {
      attempt += 1;

      if (attempt >= maxAttempts) {
        console.error(
          "❌ Gemini summarization failed after max attempts:",
          err
        );
        break;
      }

      console.warn(
        `⚠️ Retry ${attempt}/${maxAttempts} in ${backoff}ms: ${err?.message}`
      );
      await new Promise((r) => setTimeout(r, backoff));
      backoff *= 2;
    }
  }

  // Fallback: Extract first few sentences as summary
  console.warn("⚠️ Gemini summarization failed, using fallback summary.");
  const sentences = input.match(/[^.!?]+[.!?]+/g) || [];
  const fallbackSummary = sentences.slice(0, 2).join(" ").trim();
  return (
    fallbackSummary ||
    input.trim().slice(0, 300) + (input.length > 300 ? "…" : "")
  );
};

export default createChunkSummary;
