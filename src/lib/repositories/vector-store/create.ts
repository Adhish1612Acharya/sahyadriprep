import { vectorStoreTables } from "@/constants";
import { SupabaseClient } from "@supabase/supabase-js";
import { ContentChunkCreateInput } from "./types";
import { ContentChunk } from "@/models";

export async function insertInterviewExperienceContentChunks(
  vectorSupabase: SupabaseClient,
  chunks: ContentChunkCreateInput[]
): Promise<{ data: ContentChunk[] | null; error: any | null }> {
  const { data, error } = await vectorSupabase
    .from(vectorStoreTables.contentChunks)
    .insert(chunks)
    .select();

  return { data, error };
}
