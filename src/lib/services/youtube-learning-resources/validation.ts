import { SupabaseClient } from "@supabase/supabase-js";
import { getLearningResourceByIdService } from "@/lib/services/learning-resources/fetch";
import { HttpError } from "@/lib/api/http";
import { getYoutubeLearningResourceByResourceIdService } from "./fetch";

export async function validateYouTubeMetadataCreation(
  supabase: SupabaseClient,
  resourceId: string,
  userId: string,
): Promise<{ allowed: true }> {
  // 1. Fetch resource
  const resource = await getLearningResourceByIdService(supabase, resourceId);

  // 2. Check if resource type is 'youtube'
  if (resource.type !== "youtube") {
    throw new HttpError(
      "Resource must be of type 'youtube' to create YouTube metadata.",
      400,
      "INVALID_RESOURCE_TYPE",
    );
  }

  // 3. Check ownership using createdBy parameter
  if (resource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to create YouTube metadata for this resource.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  // 4. Check if YouTube metadata already exists for this resource
  const existingMediaResource =
    await getYoutubeLearningResourceByResourceIdService(supabase, resourceId);

  if (existingMediaResource) {
    throw new HttpError(
      "YouTube metadata already exists for this resource.",
      400,
      "YOUTUBE_METADATA_ALREADY_EXISTS",
    );
  }

  return { allowed: true };
}
