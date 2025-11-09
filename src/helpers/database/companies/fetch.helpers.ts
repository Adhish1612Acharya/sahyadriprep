import { createClient } from "@/lib/supabase/server";
import { Company } from "@/models/company.types";

/**
 * Fetch companies by names (case-insensitive, supports multiple)
 */
export async function fetchCompaniesByNames(
  companyNames: string[]
): Promise<Company[]> {
  if (!companyNames || companyNames.length === 0) {
    return [];
  }

  try {
    const supabase = await createClient();

    // Build OR query for multiple company names
    const orQuery = companyNames
      .map((name) => `name.ilike.%${name}%`)
      .join(",");

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .or(orQuery);

    if (error) {
      console.error("❌ Error fetching companies:", error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} companies in database`);
    return data || [];
  } catch (error: any) {
    console.error("❌ Error in fetchCompaniesByNames:", error);
    return [];
  }
}

/**
 * Get company IDs from company names
 */
export async function getCompanyIds(companyNames: string[]): Promise<string[]> {
  const companies = await fetchCompaniesByNames(companyNames);
  return companies.map((company) => company.id);
}
