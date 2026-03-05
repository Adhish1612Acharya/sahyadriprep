import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import { createMediaService } from "@/lib/services/media";
import { HttpError } from "@/lib/api/http";
import { ytDirectMediaUploadSchema } from "@/lib/zod";
import { createDriveRollback } from "@/integrations/drive/rollback";
import { getNextYoutubeDirectMediaPositionService } from "./fetch";
import { createYouTubeLearningResourceDirectMedia } from "@/lib/repositories/youtube-learning-resource-direct-media";
import { updateYoutubeLearningResourceFlagsAndSyncParentResourceService, validateCollectionLearningResourceAndYouTubeResourceOwnership } from "@/lib/services/youtube-learning-resources";
import {
  validateDirectYouTubeMediaUpload,
} from "./validation";

export async function uploadYouTubeDirectMediaOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  learningResourceId: string,
  youtubeResourceId: string,
) {
  // 1. Validate

  const { learningResource, youtubeLearningResource } =
    await validateCollectionLearningResourceAndYouTubeResourceOwnership(
      supabase,
      userId,
      collectionId,
      learningResourceId,
      youtubeResourceId,
    );

  await validateDirectYouTubeMediaUpload(learningResource, youtubeLearningResource);

  const body = await validateRequestBody(request, ytDirectMediaUploadSchema);

  // ── RollbackContext ────────────────────────────────────────────────────────
  const driveRollback = createDriveRollback();

  // 2. Upload to Drive
  const driveResult = await uploadLearningResourceMediaToDrive(body.file, {
    folder: `youtube-resources/${youtubeResourceId}/direct-media`,
    resourceId: youtubeResourceId,
    makePublic: true,
  });

  if (!driveResult.success || !driveResult.fileId || !driveResult.fileUrl) {
    throw new HttpError("Drive upload failed", 500, "DRIVE_UPLOAD_FAILED");
  }

  driveRollback.setFileId(driveResult.fileId);

  try {
    // 3. Create media record via service (Service-First)
    const media = await createMediaService(supabase, {
      fileUrl: driveResult.fileUrl!.webContentLink,
      webViewLink: driveResult.fileUrl!.webViewLink,
      fileId: driveResult.fileId,
      fileName: body.file.name,
      fileType: body.file.type,
      fileSize: body.file.size,
      uploadedBy: userId,
      usageType: "youtube_learning_resource_direct_media",
      uploadProvider: "google_drive",
      metadata: {
        source: "youtube_resource_direct_media",
        youtube_resource_id: youtubeResourceId,
        label: body.label,
      },
    });

    // 4. Fetch count for automatic position

    const position = await getNextYoutubeDirectMediaPositionService(
      supabase,
      youtubeResourceId,
    );

    // 5. Link media to YouTube resource
    const link = await createYouTubeLearningResourceDirectMedia(supabase, {
      youtube_learning_resource_id: youtubeResourceId,
      media_id: media.id,
      label: body.label,
      position: position,
      created_by: userId,
    });

    // 6. Flip flags: direct_media_resources_available=true, is_publishable=true
    const updated =
      await updateYoutubeLearningResourceFlagsAndSyncParentResourceService(
        supabase,
        youtubeResourceId,
        {
          is_publishable: true,
        },
      );

    return { youtubeResource: updated, media, link };
  } catch (err) {
    await driveRollback.execute();
    throw err;
  }
}
