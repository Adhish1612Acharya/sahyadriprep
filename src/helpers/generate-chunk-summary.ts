import { InferenceClient } from "@huggingface/inference";

const createChunkSummary = async (text: string) => {
  const maxAttempts = 3;
  let attempt = 0;
  let backoff = 500;
  const input = text.length > 8000 ? text.slice(0, 8000) : text;

  while (attempt < maxAttempts) {
    try {
      const hfToken = process.env.NEXT_PUBLIC_HF_API_KEY;
      const hfClient = new InferenceClient(hfToken);
      const res = await hfClient.summarization({
        model: "facebook/bart-large-cnn",
        inputs: input,
        // provider optional; keep hf-inference default
        // parameters can be tuned if supported by your client/provider
        parameters: { max_length: 150, min_length: 30, do_sample: false },
        provider: "hf-inference",
      });

      // Handle different possible shapes of response
      let summary = "";
      if (Array.isArray(res) && res.length > 0) {
        summary =
          (res[0] as any).summary_text ||
          (res[0] as any).generated_text ||
          (res[0] as any).text ||
          String(res[0]);
      } else if (typeof res === "object" && res !== null) {
        summary =
          (res as any).summary_text ||
          (res as any).generated_text ||
          (res as any).text ||
          JSON.stringify(res);
      } else {
        summary = String(res);
      }

      summary = summary.trim();
      if (summary.length === 0) throw new Error("Empty summary returned");
      return summary;
    } catch (err: any) {
      attempt += 1;
      if (attempt >= maxAttempts) break;
      console.warn(
        `HF summarization attempt ${attempt} failed: ${
          err?.message || err
        }. retrying in ${backoff}ms`
      );
      await new Promise((r) => setTimeout(r, backoff));
      backoff *= 2;
    }
  }

  // Final fallback: short truncation as pseudo-summary
  console.warn("HF summarization failed, using truncated fallback summary.");
  return text.trim().slice(0, 300) + (text.length > 300 ? "…" : "");
};

export default createChunkSummary;
