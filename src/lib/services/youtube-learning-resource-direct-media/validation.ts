import { HttpError } from "@/lib/api/http";
import { LearningResource, YoutubeLearningResource } from "@/models";

export async function validateDirectYouTubeMediaUpload(
  learningResource: LearningResource,
  youtubeLearningResource: YoutubeLearningResource,
): Promise<{ allowed: true }> {
  // 1. Check if resource type is 'youtube'
  if (learningResource.type !== "youtube") {
    throw new HttpError(
      "Resource must be of type 'youtube' for direct media upload.",
      400,
      "INVALID_RESOURCE_TYPE",
    );
  }

  // 2. Check direct media upload is available
  if (!youtubeLearningResource.direct_media_resources_available) {
    throw new HttpError(
      "Direct media upload is not available for this YouTube resource.",
      400,
      "DIRECT_MEDIA_UNAVAILABLE",
    );
  }

  return { allowed: true };
}
