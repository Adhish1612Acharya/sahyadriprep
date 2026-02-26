import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceDirectMedia } from "@/models";
import { LinkYouTubeDirectMediaInput } from "./types";

export async function createYouTubeLearningResourceDirectMedia(
  supabase: SupabaseClient,
  input: LinkYouTubeDirectMediaInput,
): Promise<{
  data: YoutubeLearningResourceDirectMedia | null;
  error: any | null;
}> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceDirectMedia)
    .insert({
      youtube_learning_resource_id: input.youtube_learning_resource_id,
      media_id: input.media_id,
      label: input.label,
      position: input.position ?? 0,
      created_by: input.created_by,
    })
    .select()
    .single();

  return { data, error };
}
