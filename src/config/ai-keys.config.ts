/**
 * AI API Keys Configuration
 * Separate keys for different AI features to distribute quota
 */

export const AI_KEYS = {
  OVERVIEW: process.env.NEXT_PUBLIC_GEMINI_API_KEY_OVERVIEW || process.env.GEMINI_API_KEY,
  SEGMENTS: process.env.NEXT_PUBLIC_GEMINI_API_KEY_SEGMENTS || process.env.GEMINI_API_KEY,
  FLASHCARDS: process.env.NEXT_PUBLIC_GEMINI_API_KEY_FLASHCARDS || process.env.GEMINI_API_KEY,
  TIPS: process.env.NEXT_PUBLIC_GEMINI_API_KEY_TIPS || process.env.GEMINI_API_KEY,
} as const;

/**
 * Validate that at least one API key is configured
 */
export function validateAIKeys() {
  const hasAnyKey = Object.values(AI_KEYS).some((key) => key !== undefined);

  if (!hasAnyKey) {
    throw new Error("At least one Gemini API key must be configured");
  }

  console.log("✅ AI Keys configured:", {
    overview: !!AI_KEYS.OVERVIEW,
    segments: !!AI_KEYS.SEGMENTS,
    flashcards: !!AI_KEYS.FLASHCARDS,
    tips: !!AI_KEYS.TIPS,
  });
}