import { SupabaseClient } from "@supabase/supabase-js";
import { countYoutubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";
import { handleSupabaseResult } from "@/helpers/supabase";

export async function countYoutubeResourceDirectMediaByResourceIdService(
  supabase: SupabaseClient,
  youtubeResourceId: string,
): Promise<number> {
  const { count, error } = await countYoutubeLearningResourceDirectMedia(
    supabase,
    { youtube_learning_resource_id: youtubeResourceId },
  );

  return handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Direct Media Count",
  );
}
