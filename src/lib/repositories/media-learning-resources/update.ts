import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { MediaLearningResource } from "@/models";

export async function updateMediaLearningResource(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>,
  updates: Partial<MediaLearningResource>
): Promise<{ data: MediaLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.mediaLearningResources)
    .update(updates)
    .match(filters)
    .select()
    .single();

  return { data, error };
}