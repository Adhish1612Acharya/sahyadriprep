import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteVectorEmbeddingsForInterviewExperience } from "@/lib/repositories/vector-store/delete";
import { handleSupabaseResult } from "@/helpers/supabase";
import type { ContentChunk } from "@/models";

export async function deleteVectorEmbeddingsForInterviewExperienceService(
  vectorSupabase: SupabaseClient,
  interviewExperienceId: string
): Promise<ContentChunk[]> {
  const { data, error } = await deleteVectorEmbeddingsForInterviewExperience(
    vectorSupabase,
    interviewExperienceId
  );

  const result = handleSupabaseResult<ContentChunk[]>(
    { data, error },
    "lenient",
    "ContentChunk",
    { interviewExperienceId }
  );

  return result || [];
}
