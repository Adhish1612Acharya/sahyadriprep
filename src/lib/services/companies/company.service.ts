import {
  CompanyLight,
  deleteCompanyForCollege,
  fetchCompaniesByNames,
  fetchCompanyLightByIdForCollege,
  updateCompanyScopedToCollege,
} from "@/lib/repositories/companies";
import { hasInterviewExperiencesForCompanyInCollege } from "@/lib/repositories/interview-expereinces";
import { hasInterviewSessionsForCompanyInCollege } from "@/lib/repositories/interview-sessions/fetch";
import { UpdateCompanyBody } from "@/lib/zod";
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

export async function fetchCompanyLightForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<CompanyLight | null> {
  return fetchCompanyLightByIdForCollege(supabase, id, collegeId);
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

  // Ensure company belongs to this college
  const company = await fetchCompanyLightForCollege(
    supabase,
    companyId,
    collegeId
  );
  if (!company) {
    const error = new Error("Company not found");
    (error as any).code = "NOT_FOUND";
    throw error;
  }

  // Build update payload (Zod already validated types/nullability)
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

  const updatedCompany = await updateCompanyScopedToCollege(
    supabase,
    companyId,
    collegeId,
    updateData
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
  collegeId: string
): Promise<{
  success: true;
  data: {
    id: string;
    deleted_at: string;
    deleted_by: string;
    deleted_by_role: string;
  };
}> {
  // 1) Dependencies: interview experiences
  const hasExperiences = await hasInterviewExperiencesForCompanyInCollege(
    supabase,
    id,
    collegeId
  );
  if (hasExperiences) {
    throw new Error(
      "Cannot delete company. This company has associated interview experiences. Please delete them first."
    );
  }

  // 2) Dependencies: YouTube videos
  const hasVideos = await hasInterviewSessionsForCompanyInCollege(
    supabase,
    id,
    collegeId
  );

  if (hasVideos) {
    throw new Error(
      "Cannot delete company. This company has associated YouTube videos. Please delete them first."
    );
  }

  // 3) Delete company
  await deleteCompanyForCollege(supabase, id, collegeId);

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
