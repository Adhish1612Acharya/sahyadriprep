import { UpdateCompanyBody } from "@/lib/zod";
import { Company } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { fetchCompanyLightForCollege } from "./fetch";
import { updateCompanyScopedToCollege } from "@/lib/repositories/companies";
import { handleSupabaseResult } from "@/helpers/supabase";

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
