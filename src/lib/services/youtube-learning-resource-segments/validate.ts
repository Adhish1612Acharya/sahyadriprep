import { HttpError } from "@/lib/api/http";
import { getSegmentsByYoutubeResourceIdService } from "./fetch";
import { getLearningResourceByIdService } from "../learning-resources";
import { SupabaseClient } from "@supabase/supabase-js";
import { getYoutubeLearningResourceByResourceIdService } from "../youtube-learning-resources";

export async function validateYouTubeSegmentCreation(
  supabase: SupabaseClient,
  resourceId: string,
  userId: string,
  startTime: number,
  endTime: number,
): Promise<{ allowed: true }> {
  // 1. Fetch resource
  const resource = await getLearningResourceByIdService(supabase, resourceId);

  // 2. Check if resource type is 'youtube'
  if (resource.type !== "youtube") {
    throw new HttpError(
      "Resource must be of type 'youtube' for segment creation.",
      400,
      "INVALID_RESOURCE_TYPE",
    );
  }

  if (resource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to create segments for this YouTube resource.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  const youtubeResource = await getYoutubeLearningResourceByResourceIdService(
    supabase,
    resourceId,
  );

  // 3. Check if segmentation is allowed
  if (!youtubeResource.segments_available) {
    throw new HttpError(
      "Segmentation is not allowed for this YouTube resource.",
      400,
      "SEGMENTATION_NOT_ALLOWED",
    );
  }

  // 4. Check ownership
  if (youtubeResource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to create segments for this YouTube resource.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  // 5. Validate start and end time logic
  if (startTime >= endTime) {
    throw new HttpError(
      "Start time must be before end time.",
      400,
      "INVALID_TIME_RANGE",
    );
  }

  if (startTime < 0) {
    throw new HttpError(
      "Start time cannot be negative.",
      400,
      "INVALID_START_TIME",
    );
  }

  // 6. Check against video duration
  if (
    youtubeResource.duration_seconds &&
    endTime > youtubeResource.duration_seconds
  ) {
    throw new HttpError(
      "End time cannot exceed video duration.",
      400,
      "END_TIME_EXCEEDS_DURATION",
    );
  }

  // 7. Fetch existing segments to check for overlaps
  const youtubeLearningResourceSegments =
    await getSegmentsByYoutubeResourceIdService(supabase, resourceId);

  // 8. Check for overlaps with existing segments
  if (
    youtubeLearningResourceSegments &&
    youtubeLearningResourceSegments.length > 0
  ) {
    for (const segment of youtubeLearningResourceSegments) {
      // Check if new segment overlaps with existing segment
      if (
        (startTime >= segment.start_time && startTime < segment.end_time) ||
        (endTime > segment.start_time && endTime <= segment.end_time) ||
        (startTime <= segment.start_time && endTime >= segment.end_time)
      ) {
        throw new HttpError(
          `Segment overlaps with existing segment (${segment.start_time}s - ${segment.end_time}s).`,
          400,
          "SEGMENT_OVERLAP",
        );
      }
    }
  }

  return { allowed: true };
}
