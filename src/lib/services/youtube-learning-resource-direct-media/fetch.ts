import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchYoutubeLearningResourceDirectMedia,
  fetchYoutubeLearningResourceDirectMediaWithMedia,
} from "@/lib/repositories/youtube-learning-resource-direct-media";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function getYoutubeLearningResourceDirectMediaService(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
  orderBy?: { column: string; ascending?: boolean },
): Promise<YoutubeLearningResourceDirectMedia[]> {
  const { data, error } = await fetchYoutubeLearningResourceDirectMedia(
    supabase,
    filters,
    orderBy,
  );

  return handleSupabaseResult<YoutubeLearningResourceDirectMedia[]>(
    { data, error },
    "lenient",
    "YouTube Learning Resource Direct Media",
  );
}

export async function getYoutubeLearningResourceDirectMediaWithMediaService(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
  orderBy?: { column: string; ascending?: boolean },
): Promise<any[]> {
  const { data, error } =
    await fetchYoutubeLearningResourceDirectMediaWithMedia(
      supabase,
      filters,
      orderBy,
    );

  return handleSupabaseResult<any[]>(
    { data, error },
    "lenient",
    "YouTube Learning Resource Direct Media with Media",
  );
}
