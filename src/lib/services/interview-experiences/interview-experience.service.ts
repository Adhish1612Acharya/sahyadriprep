import { fetchAuthProfileByUserId } from "../profiles";
import {
  fetchInterviewExperiences,
  InterviewExperienceWithCompanyCollegeDetails,
  InterviewFilters,
} from "@/lib/repositories/interview-expereinces";
import { handleSupabaseResult } from "@/helpers/supabase";
import { ListInterviewsParams, ListInterviewsResult } from "./types";

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
