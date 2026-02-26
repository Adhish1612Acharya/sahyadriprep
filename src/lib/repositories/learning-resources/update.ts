import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningResource } from "@/models";

export async function updateLearningResource(
  supabase: SupabaseClient,
  filters: Partial<LearningResource>,
  updates: Partial<LearningResource>,
): Promise<{ data: LearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningResources)
    .update(updates)
    .match(filters)
    .select()
    .single();

  return { data, error };
}
