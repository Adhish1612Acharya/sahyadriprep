import { HttpError } from "@/lib/api/http";
import {
  getSegmentsByYoutubeResourceIdService,
  getYoutubeLearningResourceSegmentByIdService,
} from "./fetch";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  LearningCollection,
  LearningResource,
  YoutubeLearningResource,
  YoutubeLearningResourceSegment,
} from "@/models";
import { validateCollectionLearningResourceAndYouTubeResourceOwnership } from "../youtube-learning-resources";

export async function validateYouTubeSegmentCreation(
  supabase: SupabaseClient,
  learningResource: LearningResource,
  youtubeLearningResource: YoutubeLearningResource,
  startTime: number,
  endTime: number,
): Promise<{ allowed: true }> {
  // 1. Fetch resource
  const learningResourceId = learningResource.id;

  // 2. Check if resource type is 'youtube'
  if (learningResource.type !== "youtube") {
    throw new HttpError(
      "Resource must be of type 'youtube' for segment creation.",
      400,
      "INVALID_RESOURCE_TYPE",
    );
  }

  // 3. Check if segmentation is allowed
  if (!youtubeLearningResource.segments_available) {
    throw new HttpError(
      "Segmentation is not allowed for this YouTube resource.",
      400,
      "SEGMENTATION_NOT_ALLOWED",
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
    youtubeLearningResource.duration_seconds &&
    endTime > youtubeLearningResource.duration_seconds
  ) {
    throw new HttpError(
      "End time cannot exceed video duration.",
      400,
      "END_TIME_EXCEEDS_DURATION",
    );
  }

  // 7. Fetch existing segments to check for overlaps
  const youtubeLearningResourceSegments =
    await getSegmentsByYoutubeResourceIdService(supabase, learningResourceId);

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

export async function validateCollectionLearningResourceYouTubeResourceAndSegmentOwnership(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  learningResourceId: string,
  youtubeResourceId: string,
  segmentId: string,
): Promise<{
  allowed: true;
  collection: LearningCollection;
  learningResource: LearningResource;
  youtubeLearningResource: YoutubeLearningResource;
  youtubeLearningResourceSegment: YoutubeLearningResourceSegment;
}> {
  // 1. First validate collection, learning resource, and YouTube resource ownership
  const { collection, learningResource, youtubeLearningResource } =
    await validateCollectionLearningResourceAndYouTubeResourceOwnership(
      supabase,
      userId,
      collectionId,
      learningResourceId,
      youtubeResourceId,
    );

  // 2. Fetch segment using existing service
  const youtubeLearningResourceSegment =
    await getYoutubeLearningResourceSegmentByIdService(supabase, segmentId);

  // 3. Validate segment ownership
  if (youtubeLearningResourceSegment.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to access this segment.",
      403,
      "SEGMENT_ACCESS_DENIED",
    );
  }

  // 4. Validate that segment belongs to the YouTube resource
  if (
    youtubeLearningResourceSegment.youtube_learning_resource_id !==
    youtubeLearningResource.id
  ) {
    throw new HttpError(
      "Segment does not belong to the specified YouTube resource.",
      400,
      "SEGMENT_YOUTUBE_RESOURCE_MISMATCH",
    );
  }

  return {
    allowed: true,
    collection,
    learningResource,
    youtubeLearningResource,
    youtubeLearningResourceSegment,
  };
}
