import { handleSupabaseResult } from "@/helpers/supabase";
import { InterviewSessionAIProcessUpdateRecord, updateInterviewSessionAIMetadata } from "@/lib/repositories/interview-sessions";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateInterviewSessionAIMetadataService(
  supabase: SupabaseClient,
  id: string,
  updateFields: InterviewSessionAIProcessUpdateRecord
) {
  const result = await updateInterviewSessionAIMetadata(
    supabase,
    id,
    updateFields
  );
  return handleSupabaseResult(result, "lenient", "UpdateAIMetadata");
}
