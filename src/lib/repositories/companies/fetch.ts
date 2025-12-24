// src/lib/repositories/companies/fetch.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Company } from "@/models/company.types";

/**
 * Fetch companies by names (case-insensitive, supports multiple)
 * Pure repository: requires an existing Supabase client
 */
export async function fetchCompaniesByNames(
  supabase: SupabaseClient,
  companyNames: string[]
): Promise<Company[]> {

  const orQuery = companyNames.map((name) => `name.ilike.%${name}%`).join(",");

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .or(orQuery);

  if (error) {
    console.error("❌ Error fetching companies:", error);
    return [];
  }

  return data || [];
}
