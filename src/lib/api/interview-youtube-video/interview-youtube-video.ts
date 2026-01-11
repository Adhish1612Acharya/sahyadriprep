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
import { ENV } from "@/config/env";
import { httpGet, httpPost, httpDelete } from "@/lib/api/http";

export const youtubeService = {
  getAllVideos: async (filters?: {
    company_id?: string;
    college_id?: string;
  }): Promise<YouTubeVideo[]> => {
    const params = new URLSearchParams();
    if (filters?.company_id) params.append("company_id", filters.company_id);
    if (filters?.college_id) params.append("college_id", filters.college_id);
    const response = await httpGet<{ success: boolean; data: YouTubeVideo[] }>(
      `${YOUTUBE_ENDPOINTS.BASE}?${params.toString()}`
    );
    return response.data;
  },

  getVideoById: async (id: string): Promise<YouTubeVideo> => {
    const response = await httpGet<{ success: boolean; data: YouTubeVideo }>(
      YOUTUBE_ENDPOINTS.BY_ID(id)
    );
    return response.data;
  },

  createVideo: async (
    input: CreateYouTubeVideoInput
  ): Promise<YouTubeVideo> => {
    const response = await httpPost<
      { success: boolean; data: YouTubeVideo },
      CreateYouTubeVideoInput
    >(YOUTUBE_ENDPOINTS.BASE, input);
    return response.data;
  },

  deleteVideo: async (id: string): Promise<void> => {
    await httpDelete(YOUTUBE_ENDPOINTS.BY_ID(id));
  },

  fetchMetadata: async (videoId: string): Promise<YouTubeAPIResponse> => {
    const API_KEY = ENV.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${API_KEY}`;
    const response = await httpGet<any>(url);
    if (!response.items || response.items.length === 0)
      throw new Error("Video not found");
    const video = response.items[0];
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

  processVideo: async (
    id: string,
    input: ProcessVideoInput
  ): Promise<ProcessVideoResponse> => {
    const response = await httpPost<any, any>(YOUTUBE_ENDPOINTS.PROCESS(id), {
      video_id: input.video_id,
      title: input.title,
      description: input.description,
    });
    return {
      overview: response.data.overview as OverviewData,
      segments: response.data.segments.data as VideoSegment[],
      flashcards: response.data.flashcards.data as Flashcard[],
      tips: response.data.tips.data as VideoTip[],
      transcript: {
        text: response.data.transcript.text,
        duration: response.data.transcript.duration,
        language: response.data.transcript.language,
      },
    };
  },

  getAIContent: async (id: string) => {
    const response = await httpGet<any>(YOUTUBE_ENDPOINTS.AI(id));
    return response.ai;
  },
};
