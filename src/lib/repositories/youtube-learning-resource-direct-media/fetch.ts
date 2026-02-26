import { TABLES } from "@/constants";
import { YoutubeLearningResourceDirectMedia } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";


export async function fetchYoutubeLearningResourceDirectMedia(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<{ data: YoutubeLearningResourceDirectMedia[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.youtubeLearningResourceDirectMedia)
    .select("*")
    .match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  }

  const { data, error } = await query;
  return { data, error };
}

// Repository function with media join
export async function fetchYoutubeLearningResourceDirectMediaWithMedia(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<{ data: any[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.youtubeLearningResourceDirectMedia)
    .select(`
      *,
      media:media_id(*)
    `)
    .match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  }

  const { data, error } = await query;
  return { data, error };
}