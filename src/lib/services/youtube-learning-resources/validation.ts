import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/api/http";
import {
  getYoutubeLearningResourceByIdService,
  getYoutubeLearningResourceByResourceIdService,
} from "./fetch";
import {
  LearningCollection,
  LearningResource,
  YoutubeLearningResource,
} from "@/models";
import { validateCollectionResourceOwnership } from "../learning-resources/validation";

export async function validateYouTubeMetadataCreation(
  supabase: SupabaseClient,
  resource: LearningResource,
): Promise<{ allowed: true }> {
  // 1. Resource Id
  const resourceId = resource.id;

  // 2. Check if resource type is 'youtube'
  if (resource.type !== "youtube") {
    throw new HttpError(
      "Resource must be of type 'youtube' to create YouTube metadata.",
      400,
      "INVALID_RESOURCE_TYPE",
    );
  }

  // 4. Check if YouTube metadata already exists for this resource
  const existingYoutubeLearningResourceResource =
    await getYoutubeLearningResourceByResourceIdService(supabase, resourceId);

  if (existingYoutubeLearningResourceResource) {
    throw new HttpError(
      "YouTube metadata already exists for this resource.",
      400,
      "YOUTUBE_METADATA_ALREADY_EXISTS",
    );
  }

  return { allowed: true };
}

export async function validateCollectionLearningResourceAndYouTubeResourceOwnership(
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  learningResourceId: string,
  youtubeResourceId: string,
): Promise<{
  allowed: true;
  collection: LearningCollection;
  learningResource: LearningResource;
  youtubeLearningResource: YoutubeLearningResource;
}> {
  // 1. First validate collection and learning resource ownership
  const { collection, learningResource } =
    await validateCollectionResourceOwnership(
      supabase,
      userId,
      collectionId,
      learningResourceId,
    );

  // 2. Fetch YouTube resource using existing service
  const youtubeLearningResource = await getYoutubeLearningResourceByIdService(
    supabase,
    youtubeResourceId,
  );

  // 3. Validate YouTube resource ownership
  if (youtubeLearningResource.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to access this YouTube resource.",
      403,
      "YOUTUBE_RESOURCE_ACCESS_DENIED",
    );
  }

  // 4. Validate that YouTube resource belongs to the learning resource
  if (youtubeLearningResource.resource_id !== learningResourceId) {
    throw new HttpError(
      "YouTube resource does not belong to the specified learning resource.",
      400,
      "YOUTUBE_RESOURCE_MISMATCH",
    );
  }

  return {
    allowed: true,
    collection,
    learningResource,
    youtubeLearningResource,
  };
}
