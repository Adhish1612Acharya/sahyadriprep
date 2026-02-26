import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { createMediaLearningResource } from "@/lib/repositories/media-learning-resources";
import { MediaLearningResource } from "@/models";

export async function createMediaLearningResourceService(
  supabase: SupabaseClient,
  input: Partial<MediaLearningResource>,
): Promise<MediaLearningResource> {
  const { data, error } = await createMediaLearningResource(supabase, input);

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource",
  );
}
