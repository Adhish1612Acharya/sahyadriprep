import { SupabaseClient } from "@supabase/supabase-js";
import { fetchSingleMediaLearningResource } from "@/lib/repositories/media-learning-resources/fetch";
import { MediaLearningResource } from "@/models";
import { handleSupabaseResult } from "@/helpers/supabase";

export async function fetchMediaLearningResourceByIdService(
  supabase: SupabaseClient,
  id: string
): Promise<MediaLearningResource> {
  const { data, error } = await fetchSingleMediaLearningResource(supabase, { id });
  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Error fetching media learning resource by ID."
  );
}