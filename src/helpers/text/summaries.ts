/**
 * Fallback summary when Gemini fails after retries
 */
export function createFallbackSummary(text: string): string {
  const input = text.length > 8000 ? text.slice(0, 8000) : text;

  const sentences = input.match(/[^.!?]+[.!?]+/g) || [];
  const fallbackSummary = sentences.slice(0, 2).join(" ").trim();

  return (
    fallbackSummary ||
    input.trim().slice(0, 300) + (input.length > 300 ? "…" : "")
  );
}
