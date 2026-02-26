import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteLearningCollection } from "@/lib/repositories/learning-collections";

export async function deleteLearningCollectionService(
  supabase: SupabaseClient,
  id: string
): Promise<{ id: string }> {
  const { data, error } = await deleteLearningCollection(supabase, id);

  return handleSupabaseResult<{ id: string }>(
    { data, error },
    "strict",
    "Learning Collection"
  );
}
