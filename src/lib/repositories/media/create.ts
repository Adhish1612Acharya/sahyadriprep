import { TABLES } from "@/constants";
import { Media } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { MediaCreateInput } from "./types";

export async function createMediaRecord(
  supabase: SupabaseClient,
  input: MediaCreateInput
): Promise<{ data: Media | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.media)
    .insert(input)
    .select()
    .single();

  return { data, error };
}
