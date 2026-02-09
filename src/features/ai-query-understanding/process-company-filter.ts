import { extractCompaniesFromQuery } from "@/features/ai-query-understanding/extract-companies-from-query";
import { fetchCompanyIdsByNames } from "@/lib/services/companies";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Extract companies from query and return their IDs
 * @param query - User's search query
 * @returns Array of company IDs or empty array
 */
export async function processCompanyFilter(
  supabase: SupabaseClient,
  query: string,
): Promise<string[]> {
  try {
    console.log("🔍 Processing company filter from query...");
    const startTime = Date.now();

    // Step 1: Extract company names using AI
    const companyNames = await extractCompaniesFromQuery(query);

    if (companyNames.length === 0) {
      console.log("No companies mentioned in query");
      return [];
    }

    console.log(`📋 Extracted companies: ${companyNames.join(", ")}`);

    // Step 2: Fetch company IDs from database
    const companyIds = await fetchCompanyIdsByNames(supabase, companyNames);

    const duration = Date.now() - startTime;
    console.log(
      `✅ Company filter processed in ${duration}ms: ${companyIds.length} IDs found`,
    );

    return companyIds;
  } catch (error: any) {
    console.error("❌ Error processing company filter:", error);
    return [];
  }
}
