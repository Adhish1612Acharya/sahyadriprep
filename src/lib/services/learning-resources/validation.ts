import { SupabaseClient } from "@supabase/supabase-js";
import { getLearningResourceByIdService } from "@/lib/services/learning-resources/fetch";
import { HttpError } from "@/lib/api/http";
import { getMediaLearningResourceByResourceIdService } from "../media-learning-resources";
import { getLearningCollectionByIdService } from "../learning-collections";
import { LearningCollection, LearningResource } from "@/models";

/**
 * Edge check before uploading media:
 * - Throws HttpError if not allowed, returns { allowed: true } if allowed
 */
export async function validateDirectMediaUploadToResource(
  supabase: SupabaseClient,
  resource: LearningResource,
  expectedFileType: string,
): Promise<{ allowed: true }> {
  // 1. Fetch resource
  const resourceId = resource.id;

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

export async function validateCollectionResourceOwnership(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  learningResourceId: string,
): Promise<{
  allowed: true;
  collection: LearningCollection;
  learningResource: LearningResource;
}> {
  // 1. Fetch and validate collection ownership
  const collection = await getLearningCollectionByIdService(
    supabase,
    collectionId,
  );

  if (collection.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to access this collection.",
      403,
      "COLLECTION_ACCESS_DENIED",
    );
  }

  // 2. Fetch learning resource
  const learningResource = await getLearningResourceByIdService(
    supabase,
    learningResourceId,
  );

  // 3. Validate that learning resource belongs to the collection and is owned by the user
  if (learningResource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to access this learning resource.",
      403,
      "RESOURCE_ACCESS_DENIED",
    );
  }

  if (learningResource.collection_id !== collectionId) {
    throw new HttpError(
      "Learning resource does not belong to the specified collection.",
      400,
      "RESOURCE_COLLECTION_MISMATCH",
    );
  }

  return {
    allowed: true,
    collection,
    learningResource,
  };
}
