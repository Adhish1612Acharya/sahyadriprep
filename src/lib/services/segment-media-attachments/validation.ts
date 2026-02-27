import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/api/http";
import { getYoutubeLearningResourceSegmentByIdService } from "../youtube-learning-resource-segments";

export async function validateYouTubeSegmentMediaUpload(
  supabase: SupabaseClient,
  segmentId: string,
  userId: string,
): Promise<{ allowed: true }> {
  // 1. Fetch segment
  const segment = await getYoutubeLearningResourceSegmentByIdService(
    supabase,
    segmentId,
  );

  // 2. Check ownership of the segment
  if (segment.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to upload media for this segment.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  return { allowed: true };
}
