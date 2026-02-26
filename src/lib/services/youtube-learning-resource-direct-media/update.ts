import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateYoutubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function updateYoutubeLearningResourceDirectMediaService(
  supabase: SupabaseClient,
  id: string,
  input: Partial<Pick<YoutubeLearningResourceDirectMedia, "label" | "position">>
): Promise<YoutubeLearningResourceDirectMedia> {
  const { data, error } = await updateYoutubeLearningResourceDirectMedia(
    supabase,
    { id },
    input
  );

  return handleSupabaseResult<YoutubeLearningResourceDirectMedia>(
    { data, error },
    "strict",
    "YouTube Learning Resource Direct Media"
  );
}
