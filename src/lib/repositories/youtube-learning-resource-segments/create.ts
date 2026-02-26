import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceSegment } from "@/models";
import { CreateSegmentInput } from "./types";

export async function createYoutubeLearningResourceSegment(
  supabase: SupabaseClient,
  input: CreateSegmentInput
): Promise<{
  data: YoutubeLearningResourceSegment | null;
  error: any | null;
}> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceSegments)
    .insert({
      youtube_learning_resource_id: input.youtube_learning_resource_id,
      title: input.title,
      description: input.description ?? null,
      start_time: input.start_time,
      end_time: input.end_time,
      created_by: input.created_by,
    })
    .select()
    .single();

  return { data, error };
}
