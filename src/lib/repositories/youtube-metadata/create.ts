import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YouTubeReferencesMetadata } from "@/models/youtube-references-metadata.types";

export async function createYouTubeReferencesMetadata(
  supabase: SupabaseClient,
  metadata: Pick<
    YouTubeReferencesMetadata,
    "video_id" | "title" | "duration_seconds" | "channel_id"
  >,
): Promise<{ data: YouTubeReferencesMetadata | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeReferencesMetadata)
    .insert(metadata)
    .select()
    .single();

  return { data, error };
}

export async function createMultipleYouTubeReferencesMetadata(
  supabase: SupabaseClient,
  metadata: Pick<
    YouTubeReferencesMetadata,
    "video_id" | "title" | "duration_seconds" | "channel_id"
  >[],
): Promise<{ data: YouTubeReferencesMetadata[] | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeReferencesMetadata)
    .insert(metadata)
    .select();

  return { data, error };
}
