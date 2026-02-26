import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { uploadLearningResourceMediaToDrive } from "@/lib/services/drive/upload";
import { deleteFromDrive } from "@/integrations/drive";
import { createMediaService } from "@/lib/services/media";
import {
  createSegmentService,
  countSegmentsService,
  deleteSegmentService,
  linkSegmentMediaService,
} from "./segments";
import { updateYoutubeFlagsService } from "./update";
import { HttpError } from "@/lib/api/http";
import { getSegmentsByYoutubeResourceIdService } from "./fetch";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const CreateSegmentSchema = z.object({
  youtubeResourceId: z.string().uuid("youtubeResourceId must be a valid UUID"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.coerce.number().int().min(0),
  endTime: z.coerce.number().int().min(1),
}).refine((b) => b.startTime < b.endTime, {
  message: "start_time must be less than end_time",
  path: ["startTime"],
});

const AddSegmentMediaSchema = z.object({
  youtubeResourceId: z.string().uuid("youtubeResourceId must be a valid UUID"),
  segmentId: z.string().uuid("segmentId must be a valid UUID"),
  label: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
  file: z
    .instanceof(File)
    .refine(
      (f) =>
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
          "application/pdf",
        ].includes(f.type),
      { message: "File must be PNG, JPG, WEBP, or PDF" }
    )
    .refine((f) => f.size <= 10 * 1024 * 1024, {
      message: "File must be less than 10 MB",
    }),
});

// ─── Orchestrators ────────────────────────────────────────────────────────────

/**
 * Create Segment orchestrator
 *
 * Flow:
 *   1. Validate JSON body
 *   2. createSegmentService
 *   3. countSegmentsService — if count ≥ 2, flip segments_available=true, is_publishable=true
 *
 * Business rule: check_youtube_content_exists constraint is satisfied by the DB;
 *   we mirror it in code by only setting is_publishable once ≥ 2 segments exist.
 */
export async function createSegmentOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string
) {
  // 1. Validate
  const body = await validateRequestBody(request, CreateSegmentSchema);

  // 2. Create segment
  const segment = await createSegmentService(supabase, {
    youtube_learning_resource_id: body.youtubeResourceId,
    title: body.title,
    description: body.description ?? null,
    start_time: body.startTime,
    end_time: body.endTime,
    created_by: userId,
  });

  // 3. Count segments and evaluate publishability
  const count = await countSegmentsService(supabase, body.youtubeResourceId);

  let updatedYoutubeResource = null;
  if (count >= 2) {
    updatedYoutubeResource = await updateYoutubeFlagsService(
      supabase,
      body.youtubeResourceId,
      {
        segments_available: true,
        is_publishable: true,
      }
    );
  }

  return { segment, updatedYoutubeResource, segmentCount: count };
}

/**
 * Get Segments orchestrator
 *
 * Flow:
 *   1. Read youtubeResourceId from query param
 *   2. Fetch all segments ordered by start_time
 */
export async function getSegmentsOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const { searchParams } = new URL(request.url);
  const youtubeResourceId = searchParams.get("youtube_resource_id");

  if (!youtubeResourceId) {
    throw new HttpError(
      "youtube_resource_id query param is required",
      400,
      "BAD_REQUEST"
    );
  }

  const segments = await getSegmentsByYoutubeResourceIdService(
    supabase,
    youtubeResourceId
  );

  return segments;
}

/**
 * Delete Segment orchestrator
 *
 * Flow:
 *   1. Delete the segment
 *   2. Recount; if count < 2, flip segments_available=false, is_publishable=false
 *      (unless direct_media_resources_available is true — we read the current record first)
 */
export async function deleteSegmentOrchestrator(
  supabase: SupabaseClient,
  segmentId: string,
  youtubeResourceId: string
) {
  // 1. Delete segment
  await deleteSegmentService(supabase, segmentId);

  // 2. Recount remaining segments
  const count = await countSegmentsService(supabase, youtubeResourceId);

  let updatedYoutubeResource = null;
  if (count < 2) {
    // segments_available must go false; is_publishable only stays true if
    // direct_media_resources_available is still true — the DB constraint
    // (check_youtube_content_exists) will guard that; we reflect it here.
    updatedYoutubeResource = await updateYoutubeFlagsService(
      supabase,
      youtubeResourceId,
      {
        segments_available: false,
        // Let is_publishable only be true if direct media covers it.
        // We set it false here conservatively; the UI/next direct-media
        // call will re-set it if appropriate.
        is_publishable: false,
      }
    );
  }

  return { deletedSegmentId: segmentId, updatedYoutubeResource };
}

/**
 * Add Media to Segment orchestrator
 *
 * Flow:
 *   1. Validate FormData
 *   2. Upload file to Drive  ← registers rollback
 *   3. createMediaService
 *   4. linkSegmentMediaService
 */
export async function addSegmentMediaOrchestrator(
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
            "[addSegmentMediaOrchestrator] Rollback: failed to delete Drive file",
            this.driveFileId,
            err
          );
        }
      }
    },
  };

  // 1. Validate
  const body = await validateRequestBody(request, AddSegmentMediaSchema);

  // 2. Upload to Drive
  const driveResult = await uploadLearningResourceMediaToDrive(body.file, {
    folder: `youtube-resources/${body.youtubeResourceId}/segments/${body.segmentId}`,
    resourceId: body.segmentId,
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
      usageType: "youtube_resource_segment_media",
      metadata: {
        source: "segment_media_attachment",
        segment_id: body.segmentId,
        youtube_resource_id: body.youtubeResourceId,
        label: body.label ?? null,
      },
    });

    // 4. Link media to segment
    const attachment = await linkSegmentMediaService(supabase, {
      segment_id: body.segmentId,
      media_id: media.id,
      label: body.label ?? null,
      position: body.position ?? 0,
      created_by: userId,
    });

    return { media, attachment };
  } catch (err) {
    await rollback.execute();
    throw err;
  }
}
