import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { createYoutubeLearningResourceSegment } from "@/lib/repositories/youtube-learning-resource-segments";
import { YoutubeLearningResourceSegment } from "@/models";
import { CreateSegmentInput } from "@/lib/repositories/youtube-learning-resource-segments/types";

export async function createYoutubeLearningResourceSegmentService(
  supabase: SupabaseClient,
  input: CreateSegmentInput,
): Promise<YoutubeLearningResourceSegment> {
  const { data, error } = await createYoutubeLearningResourceSegment(
    supabase,
    input,
  );

  return handleSupabaseResult<YoutubeLearningResourceSegment>(
    { data, error },
    "strict",
    "YouTube Learning Resource Segment",
  );
}
