import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { YoutubeLearningResource } from "@/models";
import { fetchSingleYoutubeLearningResource } from "@/lib/repositories/youtube-learning-resources";

export async function getYoutubeLearningResourceByIdService(
  supabase: SupabaseClient,
  id: string,
): Promise<YoutubeLearningResource> {
  const { data, error } = await fetchSingleYoutubeLearningResource(supabase, {
    id,
  });

  return handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource",
  );
}

export async function getYoutubeLearningResourceByResourceIdService(
  supabase: SupabaseClient,
  resourceId: string,
): Promise<YoutubeLearningResource> {
  const { data, error } = await fetchSingleYoutubeLearningResource(supabase, {
    resource_id: resourceId,
  });

  return handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource",
  );
}
