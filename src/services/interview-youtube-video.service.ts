import { axiosClient } from "@/lib/axiosClient";
import { YOUTUBE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { parseYouTubeDuration } from "@/helpers/youtube/youtube-video.helpers";
import {
  CreateYouTubeVideoInput,
  Flashcard,
  OverviewData,
  ProcessVideoInput,
  ProcessVideoResponse,
  VideoSegment,
  VideoTip,
  YouTubeAPIResponse,
  YouTubeVideo,
} from "@/types/services/interview-youtube-video.types";

// ============================================
// SERVICE
// ============================================

/**
 * YouTube Videos Service
 */
export const youtubeService = {
  /**
   * Fetch all YouTube videos
   */
  getAllVideos: async (filters?: {
    company_id?: string;
    college_id?: string;
  }): Promise<YouTubeVideo[]> => {
    const params = new URLSearchParams();
    if (filters?.company_id) params.append("company_id", filters.company_id);
    if (filters?.college_id) params.append("college_id", filters.college_id);

    const response = await axiosClient.get<{
      success: boolean;
      data: YouTubeVideo[];
    }>(`${YOUTUBE_ENDPOINTS.BASE}?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get video by ID (Supabase row ID)
   */
  getVideoById: async (id: string): Promise<YouTubeVideo> => {
    const response = await axiosClient.get<{
      success: boolean;
      data: YouTubeVideo;
    }>(YOUTUBE_ENDPOINTS.BY_ID(id));

    return response.data.data;
  },

  /**
   * Create a new YouTube video
   */
  createVideo: async (
    input: CreateYouTubeVideoInput
  ): Promise<YouTubeVideo> => {
    const response = await axiosClient.post<{
      success: boolean;
      data: YouTubeVideo;
    }>(YOUTUBE_ENDPOINTS.BASE, input);

    return response.data.data;
  },

  /**
   * Delete a video
   */
  deleteVideo: async (id: string): Promise<void> => {
    await axiosClient.delete(YOUTUBE_ENDPOINTS.BY_ID(id));
  },

  /**
   * Fetch metadata from YouTube API (client-side)
   */
  fetchMetadata: async (videoId: string): Promise<YouTubeAPIResponse> => {
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${API_KEY}`;

    const response = await axiosClient.get(url);
    if (!response.data) {
      throw new Error("Failed to fetch YouTube metadata");
    }

    const data = response.data;
    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = data.items[0];
    return {
      video_id: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail_url:
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url,
      duration: parseYouTubeDuration(video.contentDetails.duration),
      channel_id: video.snippet.channelId,
      published_at: video.snippet.publishedAt,
    };
  },

  // ============================================
  // AI PROCESSING
  // ============================================

  /**
   * Process video with AI to generate insights
   */
  processVideo: async (
    id: string,
    input: ProcessVideoInput
  ): Promise<ProcessVideoResponse> => {
    try {
      const response = await axiosClient.post<{
        success: boolean;
        data: {
          video_id: string;
          transcript: {
            text: string;
            segments_count: number;
            duration: number;
            language: string;
          };
          overview: any;
          segments: {
            count: number;
            data: any[];
          };
          flashcards: {
            count: number;
            data: any[];
          };
          tips: {
            count: number;
            data: any[];
          };
        };
        metadata?: {
          processed_at: string;
          processing_time_ms: number;
          ai_model: string;
          keys_used: Record<string, boolean>;
        };
      }>(YOUTUBE_ENDPOINTS.PROCESS(id), {
        video_id: input.video_id,
        title: input.title,
        description: input.description,
      });

      if (!response.data.success) {
        throw new Error("Failed to process video");
      }

      console.log("✅ AI processing completed for video", response.data);

      console.log("✅ Video processed successfully:", {
        transcript_length: response.data.data.transcript.text.length,
        segments_count: response.data.data.segments.count,
        flashcards_count: response.data.data.flashcards.count,
        tips_count: response.data.data.tips.count,
        metadata: response.data.metadata,
      });

      // ✅ FIX: Return the correctly structured data
      return {
        overview: response.data.data.overview as OverviewData,
        segments: response.data.data.segments.data as VideoSegment[],
        flashcards: response.data.data.flashcards.data as Flashcard[],
        tips: response.data.data.tips.data as VideoTip[],
        transcript: {
          text: response.data.data.transcript.text,
          duration: response.data.data.transcript.duration,
          language: response.data.data.transcript.language,
        },
      };
    } catch (error: any) {
      console.error("❌ Error processing video:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.error ||
            "Transcript not available for this video"
        );
      }

      if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (error.response?.status === 500) {
        throw new Error(
          error.response.data?.error || "Server error while processing video"
        );
      }

      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Failed to process video with AI"
      );
    }
  },

  /**
   * Fetch AI-generated content for a video (overview, segments, flashcards, tips).
   * Calls: GET /api/interview-experiences/youtube-videos/:id/ai
   */
  getAIContent: async (
    id: string
  ): Promise<{
    overview: { presentInDB: boolean; data: OverviewData | null };
    segments: { presentInDB: boolean; count: number; data: VideoSegment[] };
    flashcards: { presentInDB: boolean; count: number; data: Flashcard[] };
    tips: { presentInDB: boolean; count: number; data: VideoTip[] };
  }> => {
    try {
      const response = await axiosClient.get<{
        success: boolean;
        ai: {
          overview: { presentInDB: boolean; data: OverviewData | null };
          segments: {
            presentInDB: boolean;
            count: number;
            data: VideoSegment[];
          };
          flashcards: {
            presentInDB: boolean;
            count: number;
            data: Flashcard[];
          };
          tips: { presentInDB: boolean; count: number; data: VideoTip[] };
        };
      }>(YOUTUBE_ENDPOINTS.AI(id));

      if (!response.data.success) {
        throw new Error("Failed to fetch AI content");
      }

      return response.data.ai;
    } catch (error: any) {
      console.error("❌ Error fetching AI content:", error);
      if (error.response?.status === 404) {
        throw new Error("Video not found");
      }
      if (error.response?.status === 500) {
        throw new Error("Server error while fetching AI content");
      }
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch AI content"
      );
    }
  },
};
