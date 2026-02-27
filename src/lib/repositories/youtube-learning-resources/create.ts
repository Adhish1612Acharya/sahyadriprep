import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResource } from "@/models";
import { YoutubeLearningResourceCreateInput } from "./types";

export async function createYoutubeLearningResource(
  supabase: SupabaseClient,
  input: YoutubeLearningResourceCreateInput,
): Promise<{ data: YoutubeLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .insert([input])
    .select()
    .single();

  return { data, error };
}
