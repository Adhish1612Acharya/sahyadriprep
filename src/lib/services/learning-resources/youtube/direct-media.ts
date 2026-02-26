import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  linkYouTubeDirectMedia,
  LinkYouTubeDirectMediaInput,
} from "@/lib/repositories/youtube-learning-resources";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function linkYouTubeDirectMediaService(
  supabase: SupabaseClient,
  input: LinkYouTubeDirectMediaInput
): Promise<YoutubeLearningResourceDirectMedia> {
  const { data, error } = await linkYouTubeDirectMedia(supabase, input);

  return handleSupabaseResult<YoutubeLearningResourceDirectMedia>(
    { data, error },
    "strict",
    "YouTube Direct Media Link"
  );
}
