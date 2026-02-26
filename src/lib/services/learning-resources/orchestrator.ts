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
import { validateDirectMediaUploadToResource } from "./edge-check";
import {
  countYoutubeResourceDirectMediaService,
  countYoutubeResourceSegmentsService,
} from "@/lib/services/youtube-learning-resource-segments";
import { TABLES } from "@/constants";

export async function createLearningResourceOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
) {
  // 1. Validate request body
  const body = await validateRequestBody(request, LearningResourceCreateSchema);

  // 2. Auto-calculate next position
  const position = await getNextResourcePositionService(
    supabase,
    body.collectionId,
  );

  // 3. Create base learning resource
  const learningResource = await createLearningResourceService(supabase, {
    collectionId: body.collectionId,
    title: body.title,
    description: body.description,
    type: body.type,
    position,
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
  resourceId: string,
) {
  // ─── RollbackContext ───────────────────────────────────────────────────────
  const driveRollback = createDriveRollback();

  // 1. Validate FormData
  const body = await validateRequestBody(request, DirectMediaUploadSchema);

  // 2. Edge check before upload
  await validateDirectMediaUploadToResource(
    supabase,
    resourceId,
    { id: resourceId },
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
  // 1. Fetch base resource with extensions
  const resource = await getLearningResourceByIdService(supabase, resourceId);

  // 2. Handle YouTube resource extensions
  if (resource.type === "youtube" && resource.is_publishable) {
    const [segmentCount, directMediaCount] = await Promise.all([
      countYoutubeResourceSegmentsService(supabase, resource.id),
      countYoutubeResourceDirectMediaService(supabase, resource.id),
    ]);

    result.youtube_learning_resources[0] = {
      ...resource,
      segment_count: segmentCount,
      direct_media_count: directMediaCount,
    };
  }

  // 3. Handle Image/Document resource extensions
  if (
    (resource.type === "image" || resource.type === "document") &&
    resource.media_learning_resources?.[0]
  ) {
    // Fetch expanded media data if needed
    const { data: mediaData } = await supabase
      .from(TABLES.mediaLearningResources)
      .select(
        `
        *,
        media(*)
      `,
      )
      .eq("resource_id", resourceId)
      .single();

    if (mediaData) {
      result.media_learning_resources[0] = {
        ...result.media_learning_resources[0],
        media: mediaData.media,
      };
    }
  }

  return result;
}
