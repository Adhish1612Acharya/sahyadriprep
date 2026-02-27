import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { LearningCollectionCreateSchema } from "@/lib/zod/schema/learning-collection.schema";
import { createLearningCollectionService } from "@/lib/services/learning-collections/create";
import { createThumbnailMediaService } from "@/lib/services/media";
import { HttpError } from "@/lib/api/http";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import {
  updateLearningCollectionService,
  validateLearningCollectionOwnership,
  validateLearningCollectionPublishingStatus,
} from "@/lib/services/learning-collections";
import { deleteLearningCollectionService } from "./delete";
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
      uploadProvider: "google_drive",
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
    await driveRollback.execute();
    throw err;
  }
}

export async function publishLearningCollectionOrchestrator(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
) {
  await validateLearningCollectionPublishingStatus(
    supabase,
    collectionId,
    userId,
  );

  return await updateLearningCollectionService(supabase, collectionId, {
    status: "published",
  });
}

export async function deleteLearningCollectionOrchestrator(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
) {
  // 1. Check ownership
  await validateLearningCollectionOwnership(supabase, collectionId, userId);

  // 2. Perform deletion
  return await deleteLearningCollectionService(supabase, collectionId);
}
