import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { fetchYouTubeMetadata } from "@/features/youtube";
import { extractYouTubeVideoId } from "@/helpers/youtube/youtube-video.helpers";
import { createYoutubeLearningResourceService } from "./create";
import { HttpError } from "@/lib/api/http";
import { createYouTubeMetadataSchema } from "@/lib/zod/schema";
import { validateYouTubeMetadataCreation } from "./validation";
import { validateCollectionResourceOwnership } from "../learning-resources/validation";

export async function createYouTubeMetadataOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  resourceId: string,
) {
  // 1. Validations

  const { learningResource } = await validateCollectionResourceOwnership(
    supabase,
    userId,
    collectionId,
    resourceId,
  );

  await validateYouTubeMetadataCreation(supabase, learningResource);

  const body = await validateRequestBody(request, createYouTubeMetadataSchema);

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
      "YOUTUBE_METADATA_FETCH_FAILED",
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
