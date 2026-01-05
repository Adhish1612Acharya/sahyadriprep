import { handleSupabaseResult } from "@/helpers/supabase";
import {
  createInterviewExperience,
  InterviewExperienceCreateInput,
} from "@/lib/repositories/interview-expereinces";
import { InterviewExperience } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function createInterviewExperienceService(
  supabase: SupabaseClient,
  input: InterviewExperienceCreateInput
): Promise<InterviewExperience> {
  const { data, error } = await createInterviewExperience(supabase, input);

  const newInterviewExperience = handleSupabaseResult<InterviewExperience>(
    { data, error },
    "strict",
    "Interview Experience"
  );

  return newInterviewExperience;
}
