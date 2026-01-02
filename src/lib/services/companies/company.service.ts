import { handleSupabaseResult } from "@/helpers/supabase";
import { HttpError } from "@/lib/api/http";
import {
  CompanyLight,
  CompanyListFilters,
  CompanyWithColleges,
  createCompany,
  CreateCompanyInput,
  deleteCompanyForCollege,
  fetchCompaniesByNames,
  fetchCompaniesForCollege,
  fetchCompanyLightByIdForCollege,
  fetchCompanyWithCollegeById,
  fetchCompanyWithCollegeForCollegeById,
  updateCompanyScopedToCollege,
} from "@/lib/repositories/companies";
import { interviewExperiencesCountForCompanyInCollege } from "@/lib/repositories/interview-expereinces";
import { interviewSessionsCountForCompanyInCollege } from "@/lib/repositories/interview-sessions/fetch";
import { companySchema, UpdateCompanyBody } from "@/lib/zod";
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

export async function updateCompanyForCollege(params: {
  supabase: SupabaseClient;
  companyId: string;
  collegeId: string;
  body: UpdateCompanyBody;
  updatedByUserId: string;
  updatedByRole: string;
}): Promise<{
  data: Company;
  updated_by: string;
  updated_by_role: string;
}> {
  const {
    supabase,
    companyId,
    collegeId,
    body,
    updatedByUserId,
    updatedByRole,
  } = params;

  await fetchCompanyLightForCollege(supabase, companyId, collegeId);

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.logoUrl !== undefined) updateData.logo_url = body.logoUrl;
  if (body.website !== undefined) updateData.website = body.website;
  if (body.industry !== undefined) updateData.industry = body.industry;
  if (body.headquarters !== undefined)
    updateData.headquarters = body.headquarters;
  if (body.companySize !== undefined)
    updateData.company_size = body.companySize;
  if (body.glassdoorRating !== undefined)
    updateData.glassdoor_rating = body.glassdoorRating;

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields to update");
    (error as any).code = "NO_FIELDS";
    throw error;
  }

  const { data, error } = await updateCompanyScopedToCollege(
    supabase,
    companyId,
    collegeId,
    updateData
  );

  const updatedCompany = handleSupabaseResult<Company>(
    { data, error },
    "strict",
    "Company",
    { companyId, collegeId }
  );

  return {
    data: updatedCompany,
    updated_by: updatedByUserId,
    updated_by_role: updatedByRole,
  };
}

export async function deleteCompanyForCollegeRequest(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  userRole: string,
  collegeId: string,
  mode: "strict" | "lenient" = "strict"
): Promise<{
  success: true;
  data: {
    id: string;
    deleted_at: string;
    deleted_by: string;
    deleted_by_role: string;
  };
}> {
  const {
    data: interviewExperienceCountData,
    error: interviewExperienceCountError,
  } = await interviewExperiencesCountForCompanyInCollege(
    supabase,
    id,
    collegeId
  );
  const interviewExperienceCount = handleSupabaseResult<number | null>(
    {
      data: interviewExperienceCountData,
      error: interviewExperienceCountError,
    },
    "strict",
    "InterviewExperience",
    { companyId: id, collegeId }
  );

  if (interviewExperienceCount && interviewExperienceCount > 0) {
    throw new HttpError(
      "Cannot delete company. This company has associated interview experiences. Please delete them first.",
      400,
      "COMPANY_HAS_INTERVIEW_EXPERIENCES",
      { companyId: id, collegeId, interviewExperienceCount }
    );
  }

  const {
    data: interviewSessionsCountData,
    error: interviewSessionsCountError,
  } = await interviewSessionsCountForCompanyInCollege(supabase, id, collegeId);

  const interviewSessionsCount = handleSupabaseResult<number | null>(
    {
      data: interviewSessionsCountData,
      error: interviewSessionsCountError,
    },
    "strict",
    "InterviewSession",
    { companyId: id, collegeId }
  );

  if (interviewSessionsCount && interviewSessionsCount > 0) {
    throw new HttpError(
      "Cannot delete company. This company has associated interview sessions. Please delete them first.",
      400,
      "COMPANY_HAS_INTERVIEW_SESSIONS",
      { companyId: id, collegeId, interviewSessionsCount }
    );
  }

  const { data, error } = await deleteCompanyForCollege(
    supabase,
    id,
    collegeId
  );

  handleSupabaseResult<Company>({ data, error }, mode, "Company", {
    companyId: id,
    collegeId,
  });

  return {
    success: true,
    data: {
      id,
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      deleted_by_role: userRole,
    },
  };
}
