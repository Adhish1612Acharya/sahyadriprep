import { handleSupabaseResult } from "@/helpers/supabase";
import {
  CompanyLight,
  CompanyListFilters,
  CompanyWithColleges,
  createCompany,
  CreateCompanyInput,
  fetchCompaniesByNames,
  fetchCompaniesForCollege,
  fetchCompanyLightByIdForCollege,
  fetchCompanyWithCollegeById,
  fetchCompanyWithCollegeForCollegeById,
} from "@/lib/repositories/companies";
import { companySchema } from "@/lib/zod";
import { Company } from "@/models/company.types";
import { SupabaseClient } from "@supabase/supabase-js";
import z from "zod";

export async function fetchCompanyNames(
  supabase: SupabaseClient,
  companyNames: string[]
): Promise<Company[]> {
  if (!companyNames || companyNames.length === 0) {
    return [];
  }
  const { data, error } = await fetchCompaniesByNames(supabase, companyNames);
  return handleSupabaseResult<Company[]>(
    { data, error },
    "lenient",
    "Company",
    {
      companyNames,
    }
  );
}

export async function fetchCompanyIdsByNames(
  supabase: SupabaseClient,
  companyNames: string[]
): Promise<string[]> {
  const { data, error } = await fetchCompaniesByNames(supabase, companyNames);
  const companies = handleSupabaseResult<Company[]>(
    { data, error },
    "lenient",
    "Company",
    {
      companyNames,
    }
  );
  return companies.map((company) => company.id);
}

export async function fetchCompanyLightForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<CompanyLight> {
  const { data, error } = await fetchCompanyLightByIdForCollege(
    supabase,
    id,
    collegeId
  );

  return handleSupabaseResult<CompanyLight>(
    { data, error },
    "strict",
    "Company",
    { companyId: id, collegeId }
  );
}

export async function fetchCompanyWithCollegeForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<CompanyWithColleges | null> {
  const { data, error } = await fetchCompanyWithCollegeForCollegeById(
    supabase,
    id,
    collegeId
  );
  return handleSupabaseResult<CompanyWithColleges | null>(
    { data, error },
    "strict",
    "Company",
    { companyId: id, collegeId }
  );
}

export async function fetchCompanyWithCollegeDetailsById(
  supabase: SupabaseClient,
  id: string
): Promise<CompanyWithColleges> {
  const { data, error } = await fetchCompanyWithCollegeById(supabase, id);
  return handleSupabaseResult<CompanyWithColleges>(
    { data, error },
    "strict",
    "Company",
    { companyId: id }
  );
}

export async function listCompaniesForUser(
  supabase: SupabaseClient,
  userCollegeId: string,
  isSuperAdmin: boolean,
  filters: Partial<CompanyListFilters> = {}
): Promise<CompanyWithColleges[]> {
  const queryFilters: CompanyListFilters = {};

  // College filter (unless super admin)
  if (!isSuperAdmin && userCollegeId) {
    queryFilters.collegeId = userCollegeId;
  }

  // Merge optional filters
  Object.assign(queryFilters, filters);

  const { data, error } = await fetchCompaniesForCollege(
    supabase,
    userCollegeId,
    queryFilters
  );
  const companies = handleSupabaseResult<CompanyWithColleges[]>(
    { data, error },
    "lenient",
    "Company",
    { collegeId: userCollegeId }
  );

  return companies ?? [];
}

export async function createCompanyForCollege(
  supabase: SupabaseClient,
  body: z.infer<typeof companySchema>,
  userId: string,
  collegeId: string
): Promise<Company> {
  const insertData: CreateCompanyInput = {
    name: body.name,
    logo_url: body.logo_url ?? null,
    website: body.website ?? null,
    industry: body.industry ?? null,
    headquarters: body.headquarters ?? null,
    company_size: body.company_size ?? null,
    glassdoor_rating: body.glassdoor_rating ?? null,
    college_id: collegeId,
    created_by: userId,
  };

  const { data, error } = await createCompany(supabase, insertData);

  const createdCompany = handleSupabaseResult<Company>(
    { data, error },
    "strict",
    "Company",
    { insertData }
  );

  return createdCompany;
}

