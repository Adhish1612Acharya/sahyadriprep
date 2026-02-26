import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { countYoutubeLearningResourceSegments } from "@/lib/repositories/youtube-learning-resource-segments";
import { countYoutubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";

export async function countYoutubeResourceSegmentsService(
  supabase: SupabaseClient,
  youtubeResourceId: string,
): Promise<number> {
  const { count, error } = await countYoutubeLearningResourceSegments(
    supabase,
    { youtube_learning_resource_id: youtubeResourceId }
  );

  return handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Youtube Resource Segments Count"
  );
}


export async function countYoutubeResourceDirectMediaService(
  supabase: SupabaseClient,
  youtubeResourceId: string,
): Promise<number> {
  const { count, error } = await countYoutubeLearningResourceDirectMedia(
    supabase,
    { youtube_learning_resource_id: youtubeResourceId }
  );

  return handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Youtube Resource Direct Media Count"
  );
}