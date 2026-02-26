import { TABLES } from "@/constants";
import { YoutubeLearningResourceDirectMedia } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function countYoutubeLearningResourceDirectMedia(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
): Promise<{ count: number; error: any | null }> {
  const { count, error } = await supabase
    .from(TABLES.youtubeLearningResourceDirectMedia)
    .select("id", { count: "exact", head: true })
    .match(filters);

  return { count: count ?? 0, error };
}
