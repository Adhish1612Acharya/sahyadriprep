import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResource } from "@/models";

export async function updateSingleYoutubeLearningResource(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResource>,
  input: Partial<YoutubeLearningResource>,
): Promise<{ data: YoutubeLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .update(input)
    .match(filters)
    .select()
    .single();

  return { data, error };
}
