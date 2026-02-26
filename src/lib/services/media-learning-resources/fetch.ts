import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { 
  fetchSingleMediaLearningResource,
  fetchMediaLearningResources 
} from "@/lib/repositories/media-learning-resources";
import { MediaLearningResource } from "@/models";

export async function getMediaLearningResourceByIdService(
  supabase: SupabaseClient,
  id: string
): Promise<MediaLearningResource> {
  const { data, error } = await fetchSingleMediaLearningResource(supabase, { id });

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource"
  );
}

export async function getMediaLearningResourceByResourceIdService(
  supabase: SupabaseClient,
  resourceId: string
): Promise<MediaLearningResource> {
  const { data, error } = await fetchSingleMediaLearningResource(supabase, { resource_id: resourceId });

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource"
  );
}

export async function getMediaLearningResourcesService(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>
): Promise<MediaLearningResource[]> {
  const { data, error } = await fetchMediaLearningResources(supabase, filters);

  return handleSupabaseResult<MediaLearningResource[]>(
    { data, error },
    "lenient",
    "Media Learning Resources"
  );
}
