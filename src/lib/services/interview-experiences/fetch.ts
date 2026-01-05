import { fetchAuthProfileByUserId } from "../profiles";
import {
  fetchInterviewExperienceByIdForCollege,
  fetchInterviewExperienceOwnCreatedByIdForCollege,
  fetchInterviewExperiences,
  InterviewExperienceWithCompanyCollegeDetails,
  InterviewFilters,
} from "@/lib/repositories/interview-expereinces";
import { handleSupabaseResult } from "@/helpers/supabase";
import { ListInterviewsParams, ListInterviewsResult } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";
import { InterviewExperience } from "@/models";

export async function listInterviewExperiencesForUser({
  supabase,
  userId,
  filters,
}: ListInterviewsParams): Promise<ListInterviewsResult> {
  const authProfile = await fetchAuthProfileByUserId(supabase, userId);

  // College filter for non-superadmins
  const queryFilters: InterviewFilters = {};
  if (authProfile.role !== "super_admin") {
    queryFilters.collegeId = authProfile.college_id;
  }

  // Merge optional filters
  Object.assign(queryFilters, filters);

  const { data, error } = await fetchInterviewExperiences(
    supabase,
    queryFilters
  );

  const interviewExperienceData = handleSupabaseResult<
    InterviewExperienceWithCompanyCollegeDetails[] | null
  >({ data, error }, "lenient", "Interview Experiences", {
    filters: queryFilters,
  });

  return {
    count: interviewExperienceData?.length || 0,
    interviewExperiences: interviewExperienceData || [],
  };
}

export async function getInterviewExperienceDetailsForCollege(
  supabase: SupabaseClient,
  interviewExperienceId: string,
  collegeId: string
): Promise<InterviewExperienceWithCompanyCollegeDetails> {
  const { data, error } = await fetchInterviewExperienceByIdForCollege(
    supabase,
    interviewExperienceId,
    collegeId
  );

  return handleSupabaseResult<InterviewExperienceWithCompanyCollegeDetails>(
    { data, error },
    "strict",
    "InterviewExperience",
    { interviewExperienceId, collegeId }
  );
}

export async function getOwnInterviewExperienceForCollege(
  supabase: SupabaseClient,
  interviewExperienceId: string,
  collegeId: string,
  userId: string
): Promise<InterviewExperience> {
  const { data, error } =
    await fetchInterviewExperienceOwnCreatedByIdForCollege(
      supabase,
      interviewExperienceId,
      collegeId,
      userId
    );

  return handleSupabaseResult<InterviewExperience>(
    { data, error },
    "strict",
    "InterviewExperience",
    { interviewExperienceId, collegeId, userId }
  );
}
