import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateMediaLearningResource } from "@/lib/repositories/media-learning-resources";
import { MediaLearningResource } from "@/models";

export async function updateMediaLearningResourceService(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<MediaLearningResource>
): Promise<MediaLearningResource> {
  const { data, error } = await updateMediaLearningResource(
    supabase,
    { id },
    updates
  );

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource"
  );
}

export async function updateMediaLearningResourceByResourceIdService(
  supabase: SupabaseClient,
  resourceId: string,
  updates: Partial<MediaLearningResource>
): Promise<MediaLearningResource> {
  const { data, error } = await updateMediaLearningResource(
    supabase,
    { resource_id: resourceId },
    updates
  );

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource"
  );
}
