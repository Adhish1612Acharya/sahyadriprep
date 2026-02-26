import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import { deleteFromDrive } from "@/integrations/drive";
import { createMediaService } from "@/lib/services/media";
import { linkYouTubeDirectMediaService } from "./direct-media";
import { updateYoutubeFlagsService } from "./update";
import { HttpError } from "@/lib/api/http";

// ─── Validation Schema ────────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

const YtDirectMediaUploadSchema = z.object({
  youtubeResourceId: z.string().uuid("youtubeResourceId must be a valid UUID"),
  label: z.string().min(1, "Label is required"),
  position: z.coerce.number().int().min(0).optional(),
  file: z
    .instanceof(File)
    .refine((f) => ALLOWED_TYPES.includes(f.type), {
      message: "File must be PNG, JPG, WEBP, or PDF",
    })
    .refine((f) => f.size <= 10 * 1024 * 1024, {
      message: "File must be less than 10 MB",
    }),
});

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * upload-direct-media orchestrator
 *
 * Flow:
 *   1. Validate FormData
 *   2. Upload file to Drive  ← registers rollback
 *   3. createMediaService    ← service call, not repo
 *   4. linkYouTubeDirectMediaService
 *   5. updateYoutubeFlagsService → direct_media_resources_available=true, is_publishable=true
 */
export async function uploadYouTubeDirectMediaOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string
) {
  // ── RollbackContext ────────────────────────────────────────────────────────
  const rollback = {
    driveFileId: null as string | null,
    async execute() {
      if (this.driveFileId) {
        try {
          await deleteFromDrive(this.driveFileId);
        } catch (err) {
          console.error(
            "[uploadYouTubeDirectMediaOrchestrator] Rollback: failed to delete Drive file",
            this.driveFileId,
            err
          );
        }
      }
    },
  };

  // 1. Validate
  const body = await validateRequestBody(request, YtDirectMediaUploadSchema);

  // 2. Upload to Drive
  const driveResult = await uploadLearningResourceMediaToDrive(body.file, {
    folder: `youtube-resources/${body.youtubeResourceId}/direct-media`,
    resourceId: body.youtubeResourceId,
    makePublic: true,
  });

  if (!driveResult.success || !driveResult.fileId || !driveResult.fileUrl) {
    throw new HttpError("Drive upload failed", 500, "DRIVE_UPLOAD_FAILED");
  }

  rollback.driveFileId = driveResult.fileId;

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
      metadata: {
        source: "youtube_resource_direct_media",
        youtube_resource_id: body.youtubeResourceId,
        label: body.label,
      },
    });

    // 4. Fetch count for automatic position
    const { countSegmentsService } = await import("./segments"); // Avoid circular if any, but better use direct count repo if needed or count service
    // Actually, I'll just use the count service for direct media
    const { countYoutubeDirectMediaByResourceIdService } = await import("./fetch");
    const count = await countYoutubeDirectMediaByResourceIdService(supabase, body.youtubeResourceId);
    const position = count + 1;

    // 5. Link media to YouTube resource
    const link = await linkYouTubeDirectMediaService(supabase, {
      youtube_learning_resource_id: body.youtubeResourceId,
      media_id: media.id,
      label: body.label,
      position: position,
      created_by: userId,
    });

    // 5. Flip flags: direct_media_resources_available=true, is_publishable=true
    const updated = await updateYoutubeFlagsService(
      supabase,
      body.youtubeResourceId,
      {
        direct_media_resources_available: true,
        is_publishable: true,
      }
    );

    return { youtubeResource: updated, media, link };
  } catch (err) {
    await rollback.execute();
    throw err;
  }
}
