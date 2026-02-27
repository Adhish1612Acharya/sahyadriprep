import { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/api/http";
import { getLearningCollectionByIdService } from "@/lib/services/learning-collections/fetch";
import { getLearningResourcesByCollectionService } from "../learning-resources";

export async function validateLearningCollectionOwnership(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
): Promise<{ allowed: true }> {
  // 1. Fetch collection using existing service
  const collection = await getLearningCollectionByIdService(
    supabase,
    collectionId,
  );

  // 2. Check ownership of the collection
  if (collection.created_by !== userId) {
    throw new HttpError(
      "You don't have permission to access this learning collection.",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  return { allowed: true };
}

export async function validateLearningCollectionPublishingStatus(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
): Promise<{ allowed: true }> {
  // 1. Check ownership (this also validates collection exists)
  await validateLearningCollectionOwnership(supabase, collectionId, userId);

  // 2. Fetch resources in the collection
  const resources = await getLearningResourcesByCollectionService(
    supabase,
    collectionId,
  );

  // 3. Enforce minimum resource count (≥ 2)
  if (resources.length < 2) {
    throw new HttpError(
      `Collection must have at least 2 resources to be published. Current count: ${resources.length}`,
      400,
      "MIN_RESOURCE_COUNT_NOT_MET",
    );
  }

  // 4. Enforce all resources are publishable
  const unpublishableResources = resources.filter((r) => !r.is_publishable);
  if (unpublishableResources.length > 0) {
    throw new HttpError(
      `All resources in the collection must be ready for publication. Found ${unpublishableResources.length} draft resources.`,
      400,
      "DRAFT_RESOURCES_PRESENT",
    );
  }

  return { allowed: true };
}
