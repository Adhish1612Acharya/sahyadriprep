import { ENV } from "@/config/env";
import { AI_OUTPUT_SCHEMAS } from "@/constants/ai-output-schemas.constants";
import { AI_PROMPTS } from "@/constants/ai-prompts.constants";
import { generateStructuredAiOutput } from "@/features/ai/structured-output";

/**
 * Extract company names from user query using Gemini
 */
export async function extractCompaniesFromQuery(
  query: string
): Promise<string[]> {
  try {
    const apiKey = ENV.GEMINI_API_KEY_FIND_COMPANY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY_FIND_COMPANY is not set");
      return [];
    }

    console.log("Extracting company names from query...");
    const prompt = AI_PROMPTS.extractCompanies({ query });

    const companies = await generateStructuredAiOutput<string[]>(
      prompt,
      apiKey,
      AI_OUTPUT_SCHEMAS.companyNames
    );

    if (!Array.isArray(companies)) {
      console.warn(
        "Invalid company extraction response, returning empty array"
      );
      return [];
    }

    console.log(`Extracted ${companies.length} companies:`, companies);
    return companies;
  } catch (error) {
    console.error("Error extracting companies:", error);
    return [];
  }
}
