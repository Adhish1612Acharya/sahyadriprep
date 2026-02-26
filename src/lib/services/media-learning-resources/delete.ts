import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteMediaLearningResource } from "@/lib/repositories/media-learning-resources";

export async function deleteMediaLearningResourceService(
  supabase: SupabaseClient,
  id: string
): Promise<{ id: string }> {
  const { data, error } = await deleteMediaLearningResource(supabase, { id });

  return handleSupabaseResult<{ id: string }>(
    { data: data as { id: string }, error },
    "strict",
    "Media Learning Resource"
  );
}

export async function deleteMediaLearningResourceByResourceIdService(
  supabase: SupabaseClient,
  resourceId: string
): Promise<{ id: string }> {
  const { data, error } = await deleteMediaLearningResource(supabase, { resource_id: resourceId });

  return handleSupabaseResult<{ id: string }>(
    { data: data as { id: string }, error },
    "strict",
    "Media Learning Resource"
  );
}
