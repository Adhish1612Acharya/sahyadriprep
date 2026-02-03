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
import { Camelize } from "@/types";
import { InterviewSession } from "@/models";

export const interviewSessionApi = {
  getAllVideos: async (filters?: {
    company_id?: string;
    college_id?: string;
  }): Promise<Camelize<InterviewSessionWithCollegeAndCompanyDetails>[]> => {
    const params = new URLSearchParams();
    if (filters?.company_id) params.append("company_id", filters.company_id);
    if (filters?.college_id) params.append("college_id", filters.college_id);
    const response = await httpGet<{
      success: boolean;
      interviewSessions: Camelize<InterviewSessionWithCollegeAndCompanyDetails>[];
    }>(`${YOUTUBE_ENDPOINTS.BASE}?${params.toString()}`);
    return response.interviewSessions;
  },

  getVideoById: async (
    id: string,
  ): Promise<Camelize<InterviewSessionWithCollegeAndCompanyDetails>> => {
    const response = await httpGet<{
      success: boolean;
      interviewSession: Camelize<InterviewSessionWithCollegeAndCompanyDetails>;
    }>(YOUTUBE_ENDPOINTS.BY_ID(id));
    return response.interviewSession;
  },

  createVideo: async (
    input: CreateYouTubeVideoInput,
  ): Promise<Camelize<YouTubeVideo>> => {
    const response = await httpPost<
      { success: boolean; data: Camelize<YouTubeVideo> },
      CreateYouTubeVideoInput
    >(YOUTUBE_ENDPOINTS.BASE, input);
    return response.data;
  },

  deleteVideo: async (
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Camelize<InterviewSession>;
  }> => {
    const response = await httpDelete<{
      success: boolean;
      message: string;
      data: Camelize<InterviewSession>;
    }>(YOUTUBE_ENDPOINTS.BY_ID(id));
    return response;
  },

  fetchMetadata: async (
    videoId: string,
  ): Promise<Camelize<YouTubeAPIResponse>> => {
    const API_KEY = ENV.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${API_KEY}`;
    const response = await httpGet<any>(url);
    if (!response.items || response.items.length === 0)
      throw new Error("Video not found");
    const video = response.items[0];
    return {
      videoId: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl:
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url,
      duration: parseYouTubeDuration(video.contentDetails.duration),
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
    };
  },

  processVideo: async (
    id: string,
    input: ProcessVideoInput,
  ): Promise<Camelize<InterviewSessionAISummarizationResult>> => {
    const response = await httpPost<{
      success: boolean;
      message: string;
      aiSummary: Camelize<InterviewSessionAISummarizationResult>;
    }>(YOUTUBE_ENDPOINTS.PROCESS(id), {
      videoId: input.video_id,
      title: input.title,
      description: input.description,
    });
    return response.aiSummary;
  },

  getAIContent: async (id: string) => {
    const response = await httpGet<{
      success: boolean;
      aiSummary: Camelize<InterviewSessionAISummary>;
    }>(YOUTUBE_ENDPOINTS.AI(id));
    return response.aiSummary;
  },
};
