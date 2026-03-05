import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { YouTubeReferencesMetadata } from "@/models";
import {
  determineReferenceType,
  extractYouTubeVideoId,
} from "@/helpers/youtube";
import { HttpError } from "@/lib/api/http";
import { fetchYouTubeMetadata } from "@/features/youtube";
import {
  createMultipleYouTubeReferencesMetadata,
  createYouTubeReferencesMetadata,
} from "@/lib/repositories/youtube-metadata";

export async function createYouTubeMetadataFromUrlService(
  supabase: SupabaseClient,
  youtubeUrl: string,
): Promise<YouTubeReferencesMetadata> {
  // Extract video ID from URL
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) {
    throw new HttpError("Invalid YouTube URL", 400, "INVALID_YOUTUBE_URL");
  }

  // Fetch metadata from YouTube API
  const youtubeApiData = await fetchYouTubeMetadata(videoId);
  if (!youtubeApiData || !youtubeApiData.data) {
    throw new HttpError(
      "Failed to fetch YouTube metadata",
      400,
      "YOUTUBE_API_ERROR",
    );
  }

  const { title, duration, channel_id } = youtubeApiData.data;

  // Create metadata record
  const { data, error } = await createYouTubeReferencesMetadata(supabase, {
    video_id: videoId,
    title,
    duration_seconds: duration,
    channel_id: channel_id,
  });

  return handleSupabaseResult<YouTubeReferencesMetadata>(
    { data, error },
    "strict",
    "YouTube Metadata",
  );
}

export async function createYouTubeMetadataFromReferenceUrlsService(
  supabase: SupabaseClient,
  referenceUrls: string[],
): Promise<YouTubeReferencesMetadata[]> {
  // Filter only YouTube URLs using the helper
  const validYoutubeUrls = referenceUrls.filter(
    (url) => determineReferenceType(url) === "youtube",
  );

  if (validYoutubeUrls.length === 0) {
    return [];
  }

  // Extract video IDs and fetch metadata
  const metadataToCreate: Pick<
    YouTubeReferencesMetadata,
    "video_id" | "title" | "duration_seconds" | "channel_id"
  >[] = [];
  const failedUrls: string[] = [];

  for (const url of validYoutubeUrls) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      failedUrls.push(url);
      continue;
    }

    try {
      // Fetch metadata from YouTube API
      const youtubeApiData = await fetchYouTubeMetadata(videoId);
      if (youtubeApiData && youtubeApiData.data) {
        const { title, duration, channel_id } = youtubeApiData.data;
        metadataToCreate.push({
          video_id: videoId,
          title,
          duration_seconds: duration,
          channel_id: channel_id,
        });
      } else {
        failedUrls.push(url);
      }
    } catch (error) {
      console.error(`Failed to fetch metadata for video ID ${videoId}:`, error);
      failedUrls.push(url);
    }
  }

  // Log failed URLs for debugging
  if (failedUrls.length > 0) {
    console.warn("Failed to process YouTube URLs:", failedUrls);
  }

  // If no metadata to create, throw error
  if (metadataToCreate.length === 0) {
    throw new HttpError(
      "Failed to fetch metadata for any YouTube URLs",
      400,
      "ALL_YOUTUBE_METADATA_FAILED",
    );
  }

  // Create multiple metadata records
  const { data, error } = await createMultipleYouTubeReferencesMetadata(
    supabase,
    metadataToCreate,
  );

  return handleSupabaseResult<YouTubeReferencesMetadata[]>(
    { data, error },
    "strict",
    "YouTube Metadata Batch",
  );
}
