import { ContentChunk } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteVectorEmbeddingsForInterviewExperience(
  vectorSupabase: SupabaseClient,
  interviewExperienceId: string
): Promise<{ data: ContentChunk[] | null; error: any | null }> {
  const { data, error } = await vectorSupabase
    .from("content_chunks")
    .delete()
    .eq("metadata->>interview_experience_id", interviewExperienceId)
    .select();

  return { data, error };
}
