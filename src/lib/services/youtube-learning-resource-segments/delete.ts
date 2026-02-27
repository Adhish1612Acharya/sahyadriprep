import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteYoutubeLearningResourceSegment } from "@/lib/repositories/youtube-learning-resource-segments";
import { YoutubeLearningResourceSegment } from "@/models";

export async function deleteYoutubeLearningResourceSegmentByIdService(
  supabase: SupabaseClient,
  id: string,
): Promise<YoutubeLearningResourceSegment> {
  const { data, error } = await deleteYoutubeLearningResourceSegment(supabase, {
    id,
  });

  return handleSupabaseResult<YoutubeLearningResourceSegment>(
    { data, error },
    "strict",
    "YouTube Learning Resource Segment",
  );
}
