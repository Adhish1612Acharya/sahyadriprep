import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function deleteYoutubeLearningResourceDirectMedia(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
): Promise<{ data: Youtu | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceDirectMedia)
    .delete()
    .match(filters)
    .select("*")
    .single();

  return { data, error };
}
