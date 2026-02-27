import { SupabaseClient } from "@supabase/supabase-js";
import { getLearningResourceByIdService } from "@/lib/services/learning-resources/fetch";
import { HttpError } from "@/lib/api/http";
import { getMediaLearningResourceByResourceIdService } from "../media-learning-resources";

/**
 * Edge check before uploading media:
 * - Throws HttpError if not allowed, returns { allowed: true } if allowed
 */
export async function validateDirectMediaUploadToResource(
  supabase: SupabaseClient,
  resourceId: string,
  mediaResourceFilters: { id: string },
  expectedFileType: string,
): Promise<{ allowed: true }> {
  // 1. Fetch resource
  const resource = await getLearningResourceByIdService(supabase, resourceId);

  // 2. Fetch media-resource link
  const mediaResource = await getMediaLearningResourceByResourceIdService(
    supabase,
    resourceId,
  );

  if (mediaResource) {
    throw new HttpError(
      "Media already linked to this resource.",
      400,
      "MEDIA_ALREADY_LINKED",
    );
  }

  // 3. File type validation based on resource type
  const imageTypes = ["image/png", "image/jpeg", "image/jpg"];
  const documentTypes = ["application/pdf"];

  if (resource.type === "image" && !imageTypes.includes(expectedFileType)) {
    throw new HttpError(
      "Image resource must be a PNG, JPG, or JPEG file.",
      400,
      "IMAGE_TYPE_INVALID",
    );
  }

  if (
    resource.type === "document" &&
    !documentTypes.includes(expectedFileType)
  ) {
    throw new HttpError(
      "Document resource must be a PDF file.",
      400,
      "DOCUMENT_TYPE_INVALID",
    );
  }

  return { allowed: true };
}
