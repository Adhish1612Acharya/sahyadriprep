import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateLearningResource } from "@/lib/repositories/learning-resources";
import { LearningResource } from "@/models";
import { toSnakeCase } from "@/helpers/transformers";
import { Camelize } from "@/types";

export async function markResourceAsPublishableService(
  supabase: SupabaseClient,
  resourceId: string,
): Promise<LearningResource> {
  const { data, error } = await updateLearningResource(
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
  const { data, error } = await updateLearningResource(
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
