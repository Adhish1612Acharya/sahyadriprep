import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { LearningResourceCreateSchema } from "@/lib/zod/schema/learning-resource.schema";
import { createLearningResourceService } from "./create";
import {
  getNextResourcePositionService,
  getLearningResourceByIdService,
} from "./fetch";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import { createMediaService } from "@/lib/services/media/create";
import { markResourceAsPublishableService } from "./update";
import { HttpError } from "@/lib/api/http";
import { createMediaLearningResourceLink } from "./create";
import { DirectMediaUploadSchema } from "@/lib/zod/schema";
import { createDriveRollback } from "@/integrations/drive/rollback";
import {
  validateCollectionResourceOwnership,
  validateDirectMediaUploadToResource,
} from "./validation";
import { getSingleMediaLearningResourceWithMediaService } from "@/lib/services/media-learning-resources";
import { LearningResourceWithExtensions } from "./types";
import { validateLearningCollectionOwnership } from "../learning-collections";

export async function createLearningResourceOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
) {
  await validateLearningCollectionOwnership(supabase, collectionId, userId);

  // 1. Validate request body
  const body = await validateRequestBody(request, LearningResourceCreateSchema);

  // 2. Auto-calculate next position
  const position = await getNextResourcePositionService(supabase, collectionId);

  // 3. Create base learning resource
  const learningResource = await createLearningResourceService(supabase, {
    title: body.title,
    description: body.description,
    type: body.type,
    position,
    collectionId,
    referenceIds: body.referenceIds,
  });

  return learningResource;
}

/**
 * Single orchestrator for uploading direct media and linking it to a resource.
 */
export async function uploadDirectMediaOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  resourceId: string,
) {
  // ─── RollbackContext ───────────────────────────────────────────────────────
  const driveRollback = createDriveRollback();

  // 1. Validate FormData
  const body = await validateRequestBody(request, DirectMediaUploadSchema);

  // 2. Validate user has permission to modify the resource (ownership of collection + resource)
  const { learningResource } = await validateCollectionResourceOwnership(
    supabase,
    userId,
    collectionId,
    resourceId,
  );

  // 2. Edge check before upload
  await validateDirectMediaUploadToResource(
    supabase,
    learningResource,
    body.file.type,
  );

  // 3. Upload file to Drive
  const driveResult = await uploadLearningResourceMediaToDrive(body.file, {
    folder: `learning-resources/${resourceId}/direct-media`,
    resourceId: resourceId,
    makePublic: true,
  });

  if (!driveResult.success || !driveResult.fileId || !driveResult.fileUrl) {
    throw new HttpError("Drive upload failed", 500, "DRIVE_UPLOAD_FAILED");
  }

  // Register for rollback in case subsequent DB updates fail
  driveRollback.setFileId(driveResult.fileId);

  try {
    // 4. Create media record
    const media = await createMediaService(supabase, {
      fileUrl: driveResult.fileUrl!.webContentLink,
      webViewLink: driveResult.fileUrl!.webViewLink,
      fileId: driveResult.fileId,
      fileName: body.file.name,
      fileType: body.file.type,
      fileSize: body.file.size,
      uploadedBy: userId,
      usageType: "learning_resource",
      uploadProvider: "google_drive",
      metadata: {
        source: "learning_resource_direct_media",
        resource_id: resourceId,
        label: body.label,
      },
    });

    // 5. Link media to resource
    await createMediaLearningResourceLink(supabase, resourceId, media.id);

    // 6. Auto-publish
    const updatedResource = await markResourceAsPublishableService(
      supabase,
      resourceId,
    );

    return {
      resource: updatedResource,
      media,
    };
  } catch (err) {
    // Rollback Drive file if anything fails after upload
    await driveRollback.execute();
    throw err;
  }
}

/**
 * Get learning resource with expanded data based on type
 */
export async function getLearningResourceWithExtensionsOrchestrator(
  supabase: SupabaseClient,
  resourceId: string,
) {
  // 1. Fetch base resource (just the table data)
  const resource = await getLearningResourceByIdService(supabase, resourceId);

  // Initialize result with base resource
  const result: LearningResourceWithExtensions = {
    ...resource,
    youtube_learning_resource: null,
    direct_media_resource: null,
  };

  // 2. Handle YouTube resource extensions
  // if (resource.type === "youtube") {
  //   // First, get the YouTube learning resource for this resource
  //   const youtubeResource = await getYoutubeLearningResourceByResourceIdService(
  //     supabase,
  //     resourceId,
  //   );

  //   if (youtubeResource) {
  //     // Check if this YouTube resource has segments or direct media
  //     if (youtubeResource.segments_available) {
  //       // Count segments only
  //       const segmentCount = await countYoutubeLearningResourceSegmentsService(
  //         supabase,
  //         youtubeResource.id,
  //       );

  //       result.youtube_learning_resource = {
  //         ...youtubeResource,
  //         segment_count: segmentCount,
  //       };
  //     } else if (youtubeResource.direct_media_resources_available) {
  //       // Count direct media only
  //       const directMediaCount =
  //         await countYoutubeResourceDirectMediaByResourceIdService(
  //           supabase,
  //           youtubeResource.id,
  //         );

  //       result.youtube_learning_resource = {
  //         ...youtubeResource,
  //         direct_media_count: directMediaCount,
  //       };
  //     }
  //   }
  // }

  // 3. Handle Image/Document resource extensions
  if (resource.type === "image" || resource.type === "document") {
    // Get the single media learning resource with media data for this resource
    const mediaResourceWithMedia =
      await getSingleMediaLearningResourceWithMediaService(supabase, {
        resource_id: resourceId,
      });

    result.direct_media_resource = mediaResourceWithMedia;
  }

  return result;
}
