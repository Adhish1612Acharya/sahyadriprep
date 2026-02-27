import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { countYoutubeLearningResourceSegments } from "@/lib/repositories/youtube-learning-resource-segments";

export async function countYoutubeLearningResourceSegmentsService(
  supabase: SupabaseClient,
  youtubeResourceId: string,
): Promise<number> {
  const { count, error } = await countYoutubeLearningResourceSegments(
    supabase,
    { youtube_learning_resource_id: youtubeResourceId },
  );

  return handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Youtube Resource Segments Count",
  );
}
