import { SupabaseClient } from "@supabase/supabase-js";
import { countYoutubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function countYoutubeLearningResourceDirectMediaService(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>
): Promise<number> {
  const { count, error } = await countYoutubeLearningResourceDirectMedia(supabase, filters);

  if (error) {
    throw new Error(`Failed to count YouTube learning resource direct media: ${error.message}`);
  }

  return count;
}