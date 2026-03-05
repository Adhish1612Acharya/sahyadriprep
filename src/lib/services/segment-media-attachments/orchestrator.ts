import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import { createMediaService } from "@/lib/services/media";
import { HttpError } from "@/lib/api/http";
import { validateCollectionLearningResourceYouTubeResourceAndSegmentOwnership } from "@/lib/services/youtube-learning-resource-segments";
import { addSegmentMediaSchema } from "@/lib/zod";
import {
  createSegmentMediaAttachmentService,
  getNextSegmentMediaPositionService,
} from "@/lib/services/segment-media-attachments";
import { createDriveRollback } from "@/integrations/drive/rollback";

export async function addSegmentMediaOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  learningResourceId: string,
  youtubeResourceId: string,
  segmentId: string,
) {
  const { youtubeLearningResourceSegment } =
    await validateCollectionLearningResourceYouTubeResourceAndSegmentOwnership(
      supabase,
      userId,
      collectionId,
      learningResourceId,
      youtubeResourceId,
      segmentId,
    );

  // 1. Validate
  const body = await validateRequestBody(request, addSegmentMediaSchema);

  // ─── RollbackContext ───────────────────────────────────────────────────────
  const driveRollback = createDriveRollback();

  // 2. Upload to Drive
  const driveResult = await uploadLearningResourceMediaToDrive(body.file, {
    folder: `youtube-resources/${youtubeLearningResourceSegment.youtube_learning_resource_id}/segments/${segmentId}`,
    resourceId: segmentId,
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
      usageType: "youtube_resource_segment_media",
      uploadProvider: "google_drive",
      metadata: {
        source: "segment_media_attachment",
        segment_id: segmentId,
        youtube_resource_id:
          youtubeLearningResourceSegment.youtube_learning_resource_id,
        label: body.label ?? null,
      },
    });

    const nextPosition = await getNextSegmentMediaPositionService(
      supabase,
      segmentId,
    );

    // 4. Link media to segment
    const attachment = await createSegmentMediaAttachmentService(supabase, {
      segment_id: segmentId,
      media_id: media.id,
      label: body.label ?? null,
      position: nextPosition,
      created_by: userId,
    });

    return { media, attachment };
  } catch (err) {
    await driveRollback.execute();
    throw err;
  }
}
