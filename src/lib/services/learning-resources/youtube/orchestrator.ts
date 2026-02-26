import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { fetchYouTubeMetadata } from "@/features/youtube";
import { extractYouTubeVideoId } from "@/helpers/youtube/youtube-video.helpers";
import { createYoutubeLearningResourceService } from "./create";
import { HttpError } from "@/lib/api/http";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";

// ─── Validation Schema ────────────────────────────────────────────────────────

const CreateYouTubeMetadataSchema = z.object({
  link: z.string().url("Valid YouTube link is required"),
  segmentsAvailable: z.boolean().default(false),
});

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * YouTube Metadata Creation Orchestrator
 * 
 * POST /api/learning-resources/:id/youtube
 * 
 * Flow:
 * 1. Extract youtube_video_id from link
 * 2. Fetch duration_seconds using fetchYouTubeMetadata
 * 3. Create youtube_learning_resources record
 */
export async function createYouTubeMetadataOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  resourceId: string,
  userId: string
) {
  // 1. Validate body
  const body = await validateRequestBody(request, CreateYouTubeMetadataSchema);

  // 2. Extract Video ID
  const videoId = extractYouTubeVideoId(body.link);
  if (!videoId) {
    throw new HttpError("Invalid YouTube URL", 400, "INVALID_YOUTUBE_URL");
  }

  // 3. Fetch Metadata
  const metadataResult = await fetchYouTubeMetadata(videoId);
  if (!metadataResult.success || !metadataResult.data) {
    throw new HttpError(
      metadataResult.error || "Failed to fetch YouTube metadata",
      400,
      "YOUTUBE_METADATA_FETCH_FAILED"
    );
  }

  // 4. Compute derived fields
  // If segments_available === false -> direct_media_resources_available = true
  const directMediaAvailable = !body.segmentsAvailable;

  // 5. Create record
  const youtubeResource = await createYoutubeLearningResourceService(supabase, {
    resource_id: resourceId,
    youtube_video_id: videoId,
    duration_seconds: metadataResult.data.duration,
    segments_available: body.segmentsAvailable,
    direct_media_resources_available: directMediaAvailable,
    is_publishable: false, // Initialized to false as per blueprint
    created_by: userId,
  });

  return youtubeResource;
}
