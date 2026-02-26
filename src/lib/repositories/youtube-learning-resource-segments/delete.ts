import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceSegment } from "@/models";

export async function deleteYoutubeLearningResourceSegment(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
): Promise<{ data: YoutubeLearningResourceSegment | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceSegments)
    .delete()
    .match(filters)
    .select()
    .single();

  return { data, error };
}
