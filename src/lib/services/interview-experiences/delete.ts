import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteOwnInterviewExperienceForCollege } from "@/lib/repositories/interview-expereinces";
import { InterviewExperience } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteOwnInterviewExperienceForCollegeService(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  collegeId: string
): Promise<InterviewExperience> {
  const { data, error } = await deleteOwnInterviewExperienceForCollege(
    supabase,
    id,
    userId,
    collegeId
  );

  return handleSupabaseResult<InterviewExperience>(
    { data, error },
    "strict",
    "InterviewExperience",
    { id, userId, collegeId }
  );
}
