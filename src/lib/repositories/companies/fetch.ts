// src/lib/repositories/companies/fetch.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Company } from "@/models/company.types";
import { CompanyLight, CompanyListFilters, CompanyWithColleges } from "./types";
import { TABLES } from "@/constants";

/**
 * Fetch companies by names (case-insensitive, supports multiple)
 * Pure repository: requires an existing Supabase client
 */
export async function fetchCompaniesByNames(
  supabase: SupabaseClient,
  companyNames: string[],
): Promise<{ data: Company[] | null; error: any }> {
  const orQuery = companyNames.map((name) => `name.ilike.%${name}%`).join(",");

  const { data, error } = await supabase
    .from(TABLES.companies)
    .select("*")
    .or(orQuery);

    console.log("Error fetching companies by names:", error);

  return { data, error };
}

export async function fetchCompanyWithCollegeById(
  supabase: SupabaseClient,
  id: string,
): Promise<{ data: CompanyWithColleges | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select(
      `
      *,
      colleges (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .single();

  return { data, error };
}

export async function fetchCompanyWithCollegeForCollegeById(
  supabase: SupabaseClient,
  id: string,
  collegeId: string,
): Promise<{ data: CompanyWithColleges | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select(
      `
      *,
      colleges (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .eq("college_id", collegeId)
    .single();

  return { data, error };
}

export async function fetchCompanyLightByIdForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string,
): Promise<{ data: CompanyLight | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select("id, name, college_id, created_by")
    .eq("id", id)
    .eq("college_id", collegeId)
    .single();

  return { data, error };
}

export async function fetchCompaniesForCollege(
  supabase: SupabaseClient,
  collegeId: string,
  filters?: CompanyListFilters,
): Promise<{ data: CompanyWithColleges[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.companies)
    .select(
      `
      *,
      colleges(id, name)
    `,
    )
    .eq("college_id", collegeId)
    .order("name", { ascending: true });

  // Optional search filter
  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  // Optional industry filter
  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }

  const { data, error } = await query;
  return { data, error };
}
