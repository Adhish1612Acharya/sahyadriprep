import { handleSupabaseResult } from "@/helpers/supabase";
import { createLearningResource } from "@/lib/repositories/learning-resources";
import { LearningResource, MediaLearningResource } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { toSnakeCase } from "@/helpers/transformers";
import { LearningResourceCreateInput } from "@/lib/zod";
import { Camelize } from "@/types";
import { createMediaLearningResource } from "@/lib/repositories/media-learning-resources";

export async function createLearningResourceService(
  supabase: SupabaseClient,
  input: Camelize<LearningResourceCreateInput & { position: number , collection_id:string}>,
): Promise<LearningResource> {
  const { data, error } = await createLearningResource(
    supabase,
    toSnakeCase(input),
  );

  return handleSupabaseResult<LearningResource>(
    { data, error },
    "strict",
    "Learning Resource",
  );
}

export async function createMediaLearningResourceLink(
  supabase: SupabaseClient,
  resourceId: string,
  mediaId: string,
): Promise<MediaLearningResource> {
  const { data, error } = await createMediaLearningResource(supabase, {
    resource_id: resourceId,
    media_id: mediaId,
  });

  return handleSupabaseResult<MediaLearningResource>(
    { data, error },
    "strict",
    "Media Learning Resource",
  );
}
