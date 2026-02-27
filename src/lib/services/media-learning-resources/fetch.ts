import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchSingleMediaLearningResource,
  fetchMediaLearningResources,
  fetchSingleMediaLearningResourcesWithMedia,
} from "@/lib/repositories/media-learning-resources";
import { MediaLearningResource } from "@/models";
import { MediaLearningResourceWithMedia } from "@/lib/repositories/media-learning-resources/types";

export async function getMediaLearningResourceByIdService(
  supabase: SupabaseClient,
  id: string,
): Promise<MediaLearningResource> {
  const { data, error } = await fetchSingleMediaLearningResource(supabase, {
    id,
  });

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource",
  );
}

export async function getMediaLearningResourceByResourceIdService(
  supabase: SupabaseClient,
  resourceId: string,
): Promise<MediaLearningResource> {
  const { data, error } = await fetchSingleMediaLearningResource(supabase, {
    resource_id: resourceId,
  });

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource",
  );
}

export async function getMediaLearningResourcesService(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>,
): Promise<MediaLearningResource[]> {
  const { data, error } = await fetchMediaLearningResources(supabase, filters);

  return handleSupabaseResult<MediaLearningResource[]>(
    { data, error },
    "lenient",
    "Media Learning Resources",
  );
}

export async function getSingleMediaLearningResourceWithMediaService(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>,
): Promise<MediaLearningResourceWithMedia> {
  const { data, error } = await fetchSingleMediaLearningResourcesWithMedia(
    supabase,
    filters,
  );

  return handleSupabaseResult<MediaLearningResourceWithMedia>(
    { data, error },
    "lenient",
    "Media Learning Resources with Media",
  );
}
