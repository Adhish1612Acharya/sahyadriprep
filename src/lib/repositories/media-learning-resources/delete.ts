import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { MediaLearningResource } from "@/models";

export async function deleteMediaLearningResource(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>
): Promise<{ data: { id: string } | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.mediaLearningResources)
    .delete()
    .match(filters)
    .select("id")
    .single();

  return { data, error };
}