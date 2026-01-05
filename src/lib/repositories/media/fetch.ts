import { TABLES } from "@/constants";
import { Media } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchMediaById(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: Media | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.media)
    .select()
    .eq("id", id)
    .single();

  return { data, error };
}
