import { TABLES } from "@/constants";
import { Media } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateMedia(
  supabase: SupabaseClient,
  mediaId: string,
  updates: Partial<Omit<Media, "id" | "uploaded_at">>
): Promise<{ data: Media | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.media)
    .update(updates)
    .eq("id", mediaId)
    .select()
    .single();

  return { data, error };
}

export async function updateMediaMetadata(
  supabase: SupabaseClient,
  mediaId: string,
  updates: { metadata?: Record<string, any> }
): Promise<{ data: Media | null; error: any | null }> {
  return updateMedia(supabase, mediaId, updates);
}
