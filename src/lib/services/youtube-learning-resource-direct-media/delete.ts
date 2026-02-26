import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteYoutubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function deleteYoutubeLearningResourceDirectMediaService(
  supabase: SupabaseClient,
  id: string
): Promise< YoutubeLearningResourceDirectMedia> {
  const { data, error } = await deleteYoutubeLearningResourceDirectMedia(supabase, {id});

  return handleSupabaseResult<YoutubeLearningResourceDirectMedia>(
    { data, error },
    "strict",
    "YouTube Learning Resource Direct Media"
  );
}
