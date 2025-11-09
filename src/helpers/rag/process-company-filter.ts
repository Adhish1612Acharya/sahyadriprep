import { extractCompaniesFromQuery } from "@/helpers/ai/extract-companies-from-query";
import { getCompanyIds } from "@/helpers/database/companies/fetch.helpers";

/**
 * Extract companies from query and return their IDs
 * @param query - User's search query
 * @returns Array of company IDs or empty array
 */
export async function processCompanyFilter(query: string): Promise<string[]> {
  try {
    console.log("🔍 Processing company filter from query...");
    const startTime = Date.now();

    // Step 1: Extract company names using AI
    const companyNames = await extractCompaniesFromQuery(query);

    if (companyNames.length === 0) {
      console.log("ℹ️ No companies mentioned in query");
      return [];
    }

    console.log(`📋 Extracted companies: ${companyNames.join(", ")}`);

    // Step 2: Fetch company IDs from database
    const companyIds = await getCompanyIds(companyNames);

    const duration = Date.now() - startTime;
    console.log(
      `✅ Company filter processed in ${duration}ms: ${companyIds.length} IDs found`
    );

    return companyIds;
  } catch (error: any) {
    console.error("❌ Error processing company filter:", error);
    return [];
  }
}
