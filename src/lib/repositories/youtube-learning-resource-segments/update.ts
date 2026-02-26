import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceSegment } from "@/models";

export async function updateYoutubeLearningResourceSegment(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
  updates: Partial<YoutubeLearningResourceSegment>
): Promise<{ data: YoutubeLearningResourceSegment | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceSegments)
    .update(updates)
    .match(filters)
    .select()
    .single();

  return { data, error };
}
