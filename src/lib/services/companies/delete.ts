import { handleSupabaseResult } from "@/helpers/supabase";
import { HttpError } from "@/lib/api/http";
import { deleteCompanyForCollege } from "@/lib/repositories/companies";
import { interviewExperiencesCountForCompanyInCollege } from "@/lib/repositories/interview-expereinces";
import { interviewSessionsCountForCompanyInCollege } from "@/lib/repositories/interview-sessions/fetch";
import { Company } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

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
