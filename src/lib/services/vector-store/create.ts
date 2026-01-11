import { SupabaseClient } from "@supabase/supabase-js";
import { ContentChunkCreateInput } from "@/lib/repositories/vector-store/types";
import { ContentChunk } from "@/models";
import { insertInterviewExperienceContentChunks } from "@/lib/repositories/vector-store/create";
import { handleSupabaseResult } from "@/helpers/supabase";

export async function insertInterviewExperienceContentChunksService(
  vectorSupabase: SupabaseClient,
  chunks: ContentChunkCreateInput[]
): Promise<ContentChunk[]> {
  const result = await insertInterviewExperienceContentChunks(
    vectorSupabase,
    chunks
  );
  return (
    handleSupabaseResult<ContentChunk[] | null>(
      result,
      "lenient",
      "InterviewExperienceContentChunks"
    ) || []
  );
}
