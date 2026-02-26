import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { LearningCollectionCreateSchema } from "@/lib/zod/schema/learning-collection.schema";
import { createLearningCollectionService } from "@/lib/services/learning-collections/create";
import { createThumbnailMediaService } from "@/lib/services/media";
import { HttpError } from "@/lib/api/http";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import { getLearningResourcesByCollectionService } from "@/lib/services/learning-resources";
import { updateLearningCollectionService } from "@/lib/services/learning-collections";
import { deleteLearningCollectionService } from "./delete";
import { requireCollectionOwnershipService } from "./auth";
import { createDriveRollback } from "@/integrations/drive/rollback";

export async function createLearningCollectionOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string,
) {
  // ─── RollbackContext ───────────────────────────────────────────────────────
  const driveRollback = createDriveRollback();

  // 1. Validate request body
  const body = await validateRequestBody(
    request,
    LearningCollectionCreateSchema,
  );

  // 2. Create the base collection record first (without thumbnail yet)
  // This gives us the ID needed for the Drive folder path
  const learningCollection = await createLearningCollectionService(supabase, {
    title: body.title,
    description: body.description,
    isPremium: body.isPremium,
    visibility: body.visibility,
    status: body.status,
    createdBy: userId,
  });

  try {
    // 3. Upload thumbnail to Drive using the Collection ID in the path
    const driveUploadResult = await uploadLearningResourceMediaToDrive(
      body.thumbnail,
      {
        folder: `learning-collections/${learningCollection.id}/thumbnails`,
        resourceId: learningCollection.id,
        makePublic: true,
      },
    );

    if (
      !driveUploadResult.success ||
      !driveUploadResult.fileId ||
      !driveUploadResult.fileUrl
    ) {
      throw new HttpError("Drive upload failed", 500, "DRIVE_UPLOAD_FAILED");
    }

    // Register for rollback in case subsequent DB updates fail
    driveRollback.setFileId(driveUploadResult.fileId);

    // 4. Create the media record with the Drive links
    const media = await createThumbnailMediaService(supabase, {
      fileId: driveUploadResult.fileId,
      fileUrl: driveUploadResult.fileUrl.webContentLink, // This is webContentLink
      webViewLink: driveUploadResult.fileUrl.webViewLink,
      fileName: body.thumbnail.name,
      fileType: body.thumbnail.type,
      fileSize: body.thumbnail.size,
      uploadedBy: userId,
      resourceType: "learning_collection",
      resourceId: learningCollection.id,
    });

    // 5. Update the collection with the thumbnailMediaId
    const updatedCollection = await updateLearningCollectionService(
      supabase,
      learningCollection.id,
      {
        thumbnailMediaId: media.id,
      },
    );

    return {
      ...updatedCollection,
      thumbnail_media: media,
    };
  } catch (err) {
    // If anything fails after collection creation, we might want to delete 
    // the collection or just the drive file. Here we prioritize drive cleanup.
    await driveRollback.execute();
    throw err;
  }
}

/**
 * Publish Learning Collection orchestrator
 *
 * Enforces business rules:
 *   1. Collection must have ≥ 2 resources.
 *   2. All resources must have is_publishable = true.
 */
export async function publishLearningCollectionOrchestrator(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string
) {
  // 0. Check ownership
  await requireCollectionOwnershipService(supabase, collectionId, userId);

  // 1. Fetch resources
  const resources = await getLearningResourcesByCollectionService(
    supabase,
    collectionId
  );

  // 2. enforce count ≥ 2
  if (resources.length < 2) {
    throw new HttpError(
      `Collection must have at least 2 resources to be published. Current count: ${resources.length}`,
      400,
      "MIN_RESOURCE_COUNT_NOT_MET"
    );
  }

  // 3. enforce all are publishable
  const unpublishable = resources.filter((r) => !r.is_publishable);
  if (unpublishable.length > 0) {
    throw new HttpError(
      `All resources in the collection must be ready for publication. Found ${unpublishable.length} draft resources.`,
      400,
      "DRAFT_RESOURCES_PRESENT"
    );
  }

  // 4. Update status to 'published'
  return await updateLearningCollectionService(supabase, collectionId, {
    status: "published",
  });
}

/**
 * Delete Learning Collection orchestrator
 * 
 * Enforces ownership before deletion.
 */
export async function deleteLearningCollectionOrchestrator(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string
) {
  // 1. Check ownership
  await requireCollectionOwnershipService(supabase, collectionId, userId);

  // 2. Perform deletion
  return await deleteLearningCollectionService(supabase, collectionId);
}

