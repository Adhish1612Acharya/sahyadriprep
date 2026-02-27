import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResource } from "@/models";

/**
 * Fetch a single YouTube learning resource by its parent resource ID.
 */
export async function fetchSingleYoutubeLearningResource(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResource>,
): Promise<{ data: YoutubeLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .select("*")
    .match(filters)
    .single();

  return { data, error };
}

export async function fetchYoutubeLearningResources(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResource>,
) {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .select("*")
    .match(filters);

  return { data, error };
}
