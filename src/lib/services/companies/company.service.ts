import { fetchCompaniesByNames } from "@/lib/repositories/companies";
import { Company } from "@/models/company.types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchCompanyNames(
  supabase: SupabaseClient,
  companyNames: string[]
): Promise<Company[]> {
  // ✅ Input validation / guard belongs in the service
  if (!companyNames || companyNames.length === 0) {
    return [];
  }

  try {
    return await fetchCompaniesByNames(supabase, companyNames);
  } catch (error: any) {
    console.error("❌ Error in fetchCompaniesByNames service:", error);
    return [];
  }
}

export async function fetchCompanyIdsByNames(
  supabase: SupabaseClient,
  companyNames: string[]
): Promise<string[]> {
  const companies = await fetchCompaniesByNames(supabase, companyNames);
  return companies.map((company) => company.id);
}
