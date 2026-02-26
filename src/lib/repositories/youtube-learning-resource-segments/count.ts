import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceSegment } from "@/models";

export async function countYoutubeLearningResourceSegments(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>
): Promise<{ count: number; error: any | null }> {
  const { count, error } = await supabase
    .from(TABLES.youtubeLearningResourceSegments)
    .select("id", { count: "exact", head: true })
    .match(filters);

  return { count: count ?? 0, error };
}