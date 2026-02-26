import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceSegment } from "@/models";

export async function fetchYoutubeLearningResourceSegments(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
  orderBy?: { column: string; ascending?: boolean },
): Promise<{
  data: YoutubeLearningResourceSegment[] | null;
  error: any | null;
}> {
  let query = supabase
    .from(TABLES.youtubeLearningResourceSegments)
    .select("*")
    .match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, {
      ascending: orderBy.ascending ?? true,
    });
  }

  const { data, error } = await query;
  return { data, error };
}

export async function fetchSingleYoutubeLearningResourceSegment(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
): Promise<{
  data: YoutubeLearningResourceSegment | null;
  error: any | null;
}> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceSegments)
    .select("*")
    .match(filters)
    .single();

  return { data, error };
}
