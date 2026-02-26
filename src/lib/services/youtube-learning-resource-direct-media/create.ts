import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { createYouTubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";
import { YoutubeLearningResourceDirectMedia } from "@/models";
import { LinkYouTubeDirectMediaInput } from "@/lib/repositories/youtube-learning-resource-direct-media/types";

export async function createYoutubeLearningResourceDirectMediaService(
  supabase: SupabaseClient,
  input: LinkYouTubeDirectMediaInput
): Promise<YoutubeLearningResourceDirectMedia> {
  const { data, error } = await createYouTubeLearningResourceDirectMedia(supabase, input);

  return handleSupabaseResult<YoutubeLearningResourceDirectMedia>(
    { data, error },
    "strict",
    "YouTube Learning Resource Direct Media"
  );
}
