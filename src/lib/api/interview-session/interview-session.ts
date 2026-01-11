import { YOUTUBE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { parseYouTubeDuration } from "@/helpers/youtube/youtube-video.helpers";
import {
  CreateYouTubeVideoInput,
  ProcessVideoInput,
  YouTubeAPIResponse,
  YouTubeVideo,
} from "@/types/services/interview-youtube-video.types";
import { ENV } from "@/config/env";
import { httpGet, httpPost, httpDelete } from "@/lib/api/http";
import { InterviewSessionWithCollegeAndCompanyDetails } from "@/lib/repositories/interview-sessions";
import { InterviewSessionAISummarizationResult } from "@/lib/services/interview-sessions";
import { InterviewSessionAISummary } from "@/lib/api/interview-session";

export const interviewSessionApi = {
  getAllVideos: async (filters?: {
    company_id?: string;
    college_id?: string;
  }): Promise<InterviewSessionWithCollegeAndCompanyDetails[]> => {
    const params = new URLSearchParams();
    if (filters?.company_id) params.append("company_id", filters.company_id);
    if (filters?.college_id) params.append("college_id", filters.college_id);
    const response = await httpGet<{
      success: boolean;
      interviewSessions: InterviewSessionWithCollegeAndCompanyDetails[];
    }>(`${YOUTUBE_ENDPOINTS.BASE}?${params.toString()}`);
    return response.interviewSessions;
  },

  getVideoById: async (
    id: string
  ): Promise<InterviewSessionWithCollegeAndCompanyDetails> => {
    const response = await httpGet<{
      success: boolean;
      interviewSession: InterviewSessionWithCollegeAndCompanyDetails;
    }>(YOUTUBE_ENDPOINTS.BY_ID(id));
    return response.interviewSession;
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
  ): Promise<InterviewSessionAISummarizationResult> => {
    const response = await httpPost<{
      success: boolean;
      message: string;
      aiSummary: InterviewSessionAISummarizationResult;
    }>(YOUTUBE_ENDPOINTS.PROCESS(id), {
      video_id: input.video_id,
      title: input.title,
      description: input.description,
    });
    return response.aiSummary;
  },

  getAIContent: async (id: string) => {
    const response = await httpGet<{
      success: boolean;
      aiSummary: InterviewSessionAISummary;
    }>(YOUTUBE_ENDPOINTS.AI(id));
    return response.aiSummary;
  },
};
