// src/lib/repositories/companies/fetch.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Company } from "@/models/company.types";
import { CompanyLight, CompanyWithColleges } from "./types";
import { TABLES } from "@/constants";

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
    .from(TABLES.companies)
    .select("*")
    .or(orQuery);

  if (error) {
    console.error("❌ Error fetching companies:", error);
    return [];
  }

  return data || [];
}

export async function fetchCompanyWithCollegeById(
  supabase: SupabaseClient,
  id: string
): Promise<CompanyWithColleges | null> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select(
      `
      *,
      colleges (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null; // Not found
  if (error) throw new Error(`Failed to fetch company: ${error.message}`);

  return data as CompanyWithColleges;
}

export async function fetchCompanyWithCollegeForCollegeById(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<CompanyWithColleges | null> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select(
      `
      *,
      colleges (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .eq("college_id", collegeId)
    .single();

  if (error?.code === "PGRST116") return null; // Not found or not in this college
  if (error) throw new Error(`Failed to fetch company: ${error.message}`);

  return data as CompanyWithColleges;
}

export async function fetchCompanyLightByIdForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<CompanyLight | null> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select("id, name, college_id, created_by")
    .eq("id", id)
    .eq("college_id", collegeId)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(`Failed to fetch company: ${error.message}`);

  return data as CompanyLight;
}
