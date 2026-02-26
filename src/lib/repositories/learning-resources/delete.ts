import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningResource } from "@/models";

export async function deleteSingleLearningResource(
  supabase: SupabaseClient,
  filters: Partial<LearningResource>
): Promise<{ data: { id: string } | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningResources)
    .delete()
    .match(filters)
    .select("id")
    .single();

  return { data, error };
}