import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResource } from "@/models";

export interface YoutubeLearningResourceFlags {
  is_publishable?: boolean;
  segments_available?: boolean;
  direct_media_resources_available?: boolean;
}

/**
 * Updates one or more boolean flags on a youtube_learning_resources record.
 * Pass only the flags you want to change.
 */
export async function updateYoutubeLearningResourceFlags(
  supabase: SupabaseClient,
  id: string,
  flags: YoutubeLearningResourceFlags
): Promise<{ data: YoutubeLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .update(flags)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}
