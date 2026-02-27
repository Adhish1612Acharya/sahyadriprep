import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchYoutubeLearningResourceDirectMedia,
  fetchYoutubeLearningResourceDirectMediaWithMedia,
} from "@/lib/repositories/youtube-learning-resource-direct-media";
import { YoutubeLearningResourceDirectMedia } from "@/models";
import { countYoutubeResourceDirectMediaByResourceIdService } from "./count";

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

export async function getNextYoutubeDirectMediaPositionService(
  supabase: SupabaseClient,
  youtubeLearningResourceId: string,
): Promise<number> {
  const count = await countYoutubeResourceDirectMediaByResourceIdService(
    supabase,
    youtubeLearningResourceId,
  );

  // Next position is count + 1 (since positions are 1-based)
  return count + 1;
}
