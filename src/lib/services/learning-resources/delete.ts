import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
  import { deleteSingleLearningResource } from "@/lib/repositories/learning-resources/delete";

export async function deleteLearningResourceService(
  supabase: SupabaseClient,
  id: string
): Promise<{ id: string }> {
  const { data, error } = await deleteSingleLearningResource(supabase, { id });

  return handleSupabaseResult<{ id: string }>(
    { data: data as { id: string }, error },
    "strict",
    "Learning Resource"
  );
}
