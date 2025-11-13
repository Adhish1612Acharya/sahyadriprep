import { callGemini } from "@/lib/gemini/gemini";

/**
 * Extract company names from user query using Gemini
 */
export async function extractCompaniesFromQuery(
  query: string
): Promise<string[]> {
  try {
    const prompt = `You are a company name extractor. Extract all company names mentioned in the user's query.

Rules:
1. Return ONLY company names (e.g., Google, Microsoft, Amazon, Netflix)
2. Return as a JSON array of strings: ["Company1", "Company2"]
3. If no companies mentioned, return empty array: []
4. Use standard company names (e.g., "Google" not "google inc")
5. Include variations (e.g., if user says "FAANG", return ["Facebook", "Amazon", "Apple", "Netflix", "Google"])
6. Do not include generic terms like "tech company", "startup", etc.

User query: "${query}"

Return ONLY the JSON array, nothing else.`;

    const apiKey = process.env.GEMINI_API_KEY_FIND_COMPANY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY_FIND_COMPANY is not set");
      return [];
    }

    console.log("🏢 Extracting company names from query...");

    const companies = await callGemini(prompt, apiKey, "gemini-2.5-flash");

    if (!Array.isArray(companies)) {
      console.warn(
        "⚠️ Invalid company extraction response, returning empty array"
      );
      return [];
    }

    console.log(`✅ Extracted ${companies.length} companies:`, companies);
    return companies;
  } catch (error: any) {
    console.error("❌ Error extracting companies:", error);
    return []; // Fallback to empty array on error
  }
}
