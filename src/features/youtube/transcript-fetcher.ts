import { ENV } from "@/config/env";
import { parseYouTubeDuration } from "@/helpers/youtube/youtube-video.helpers";
import { axiosClient } from "@/lib/axiosClient";
import { TranscriptData } from "./types";

/**
 * Fetch video metadata from YouTube Data API v3
 */
export const fetchYouTubeMetadata = async (videoId: string) => {
  const API_KEY = ENV.YOUTUBE_API_KEY;

  if (!API_KEY) {
    throw new Error("YouTube API key is not configured");
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${API_KEY}`;

  console.log("🎬 Fetching YouTube metadata for:", videoId);

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `YouTube API error: ${error.error?.message || "Failed to fetch video"}`
    );
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found or is private");
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const contentDetails = video.contentDetails;

  const durationInSeconds = parseYouTubeDuration(contentDetails.duration);

  console.log("✅ Metadata fetched:", {
    title: snippet.title,
    duration: durationInSeconds,
  });

  return {
    video_id: videoId,
    title: snippet.title,
    description: snippet.description,
    thumbnail_url:
      snippet.thumbnails.maxres?.url ||
      snippet.thumbnails.high?.url ||
      snippet.thumbnails.default?.url,
    duration: durationInSeconds,
    channel_id: snippet.channelId,
    published_at: snippet.publishedAt,
  };
};

/**
 * Fetch YouTube transcript from external API
 * @param videoId - YouTube video ID
 * @returns TranscriptData with text, segments, duration, and language
 */
export const fetchYouTubeTranscript = async (
  videoId: string
): Promise<TranscriptData | null> => {
  try {
    console.log("🔍 Retrieving transcript for video ID:", videoId);

    // ✅ Use external transcript API via axiosClient
    const TRANSCRIPT_API_URL =
      ENV.YOUTUBE_TRANSCRIPT_API_URL ||
      "https://youtubetranscript-c3wz.onrender.com";

    const response = await axiosClient.get(
      `${TRANSCRIPT_API_URL}/api/transcript/${videoId}`
    );

    console.log("📄 Transcript API response received", response);
    // ✅ Validate response structure
    if (!response.data || !response.data.success || !response.data.data) {
      console.error("❌ Invalid response structure:", response.data);
      throw new Error("Invalid response from transcript API");
    }

    const { text, segments, duration, language } = response.data.data;

    // ✅ Validate transcript data
    if (!text || !segments || segments.length === 0) {
      console.error("❌ Empty transcript received");
      return null;
    }

    console.log("✅ Transcript fetched successfully:", {
      characters: text.length,
      segments: segments.length,
      duration: duration || "unknown",
      language: language || "en",
    });

    return response.data.data as TranscriptData;
  } catch (error: any) {
    console.error("❌ Error fetching transcript:", error);

    // ✅ Better error logging
    if (error.response) {
      // API returned an error response
      console.error("Error details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });

      // Handle specific error cases
      if (error.response.status === 404) {
        console.error("❌ Transcript not available for this video");
      } else if (error.response.status === 403) {
        console.error("❌ Transcripts are disabled for this video");
      } else if (error.response.status >= 500) {
        console.error("❌ Transcript API server error");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("❌ No response from transcript API:", {
        message: error.message,
        timeout: error.code === "ECONNABORTED",
      });
    } else {
      // Something else happened
      console.error("❌ Unexpected error:", {
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      });
    }

    return null;
  }
};
