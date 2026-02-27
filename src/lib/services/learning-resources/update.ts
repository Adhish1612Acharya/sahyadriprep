import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { LearningResource } from "@/models";
import { toSnakeCase } from "@/helpers/transformers";
import { Camelize } from "@/types";
import { updateSingleLearningResource } from "@/lib/repositories/learning-resources";

export async function markResourceAsPublishableService(
  supabase: SupabaseClient,
  resourceId: string,
): Promise<LearningResource> {
  const { data, error } = await updateSingleLearningResource(
    supabase,
    { id: resourceId },
    { is_publishable: true },
  );

  return handleSupabaseResult<LearningResource>(
    { data, error },
    "strict",
    "Learning Resource",
  );
}

export async function updateLearningResourceService(
  supabase: SupabaseClient,
  id: string,
  input: Partial<Camelize<LearningResource>>,
): Promise<LearningResource> {
  const { data, error } = await updateSingleLearningResource(
    supabase,
    { id },
    toSnakeCase(input),
  );

  return handleSupabaseResult<LearningResource>(
    { data, error },
    "strict",
    "Learning Resource",
  );
}

export async function syncLearningResourcePublishableStatusService(
  supabase: SupabaseClient,
  resourceId: string,
  isPublishable: boolean,
): Promise<LearningResource> {
  const { data, error } = await updateSingleLearningResource(
    supabase,
    { id: resourceId },
    { is_publishable: isPublishable },
  );

  return handleSupabaseResult<LearningResource>(
    { data, error },
    "strict",
    "Learning Resource",
  );
}
