import { TABLES } from "@/constants";
import { Media } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateMediaMetadata(
  supabase: SupabaseClient,
  mediaId: string,
  updates: { metadata?: Record<string, any> }
): Promise<{ data: Media | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.media)
    .update(updates)
    .eq("id", mediaId)
    .select()
    .single();

  return { data, error };
}
