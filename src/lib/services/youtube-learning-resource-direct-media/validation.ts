import { SupabaseClient } from "@supabase/supabase-js";
import { getLearningResourceByIdService } from "@/lib/services/learning-resources/fetch";
import { HttpError } from "@/lib/api/http";
import { getYoutubeLearningResourceByResourceIdService } from "../youtube-learning-resources";

export async function validateDirectYouTubeMediaUpload(
  supabase: SupabaseClient,
  resourceId: string,
  userId: string,
): Promise<{ allowed: true }> {
  // 1. Fetch resource
  const resource = await getLearningResourceByIdService(supabase, resourceId);

  // 2. Check if resource type is 'youtube'
  if (resource.type !== "youtube") {
    throw new HttpError(
      "Resource must be of type 'youtube' for direct media upload.",
      400,
      "INVALID_RESOURCE_TYPE",
    );
  }

  // 3. Check ownership
  if (resource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to upload media for this YouTube resource.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  const youtubeResource = await getYoutubeLearningResourceByResourceIdService(
    supabase,
    resourceId,
  );

  // 4. Check ownership  and  direct media upload is available

  if (youtubeResource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to upload media for this YouTube resource.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  if (!youtubeResource.direct_media_resources_available) {
    throw new HttpError(
      "Direct media upload is not available for this YouTube resource.",
      400,
      "DIRECT_MEDIA_UNAVAILABLE",
    );
  }

  return { allowed: true };
}
