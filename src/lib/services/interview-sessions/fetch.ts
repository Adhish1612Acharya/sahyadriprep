import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchInterviewSessionsForCollege } from "@/lib/repositories/interview-sessions/fetch";
import type {
  InterviewSessionFilters,
  InterviewSessionWithCollegeAndCompanyDetails,
} from "@/lib/repositories/interview-sessions";
import { handleSupabaseResult } from "@/helpers/supabase";

export async function getInterviewSessionsForCollege(
  supabase: SupabaseClient,
  collegeId: string,
  filters: InterviewSessionFilters
): Promise<InterviewSessionWithCollegeAndCompanyDetails[]> {
  const { data, error } = await fetchInterviewSessionsForCollege(
    supabase,
    filters,
    collegeId
  );

  return handleSupabaseResult<InterviewSessionWithCollegeAndCompanyDetails[]>(
    { data, error },
    "lenient",
    "Interview Sessions"
  );
}
