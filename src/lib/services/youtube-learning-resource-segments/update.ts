import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateYoutubeLearningResourceSegment } from "@/lib/repositories/youtube-learning-resource-segments";
import { YoutubeLearningResourceSegment } from "@/models";

export async function updateYoutubeLearningResourceSegmentService(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
  updates: Partial<YoutubeLearningResourceSegment>,
): Promise<YoutubeLearningResourceSegment> {
  const { data, error } = await updateYoutubeLearningResourceSegment(
    supabase,
    filters,
    updates,
  );

  return handleSupabaseResult<YoutubeLearningResourceSegment>(
    { data, error },
    "strict",
    "YouTube Learning Resource Segment",
  );
}
