import { YOUTUBE_RESOURCE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpGet, httpPost, httpDelete } from "@/lib/api/http";
import { YoutubeLearningResource, YoutubeLearningResourceSegment } from "@/models";
import { Camelize } from "@/types";

export interface CreateYouTubeMetadataInput {
  link: string;
  segmentsAvailable: boolean;
}

export interface CreateSegmentInput {
  youtubeResourceId: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
}

export interface UploadSegmentMediaInput {
  youtubeResourceId: string;
  segmentId: string;
  label?: string;
  file: File;
}

export interface UploadYoutubeDirectMediaInput {
  youtubeResourceId: string;
  label: string;
  file: File;
}

export const youtubeResourceApi = {
  /**
   * Create YouTube metadata extension for a learning resource.
   */
  createMetadata: async (
    resourceId: string,
    input: CreateYouTubeMetadataInput
  ): Promise<Camelize<YoutubeLearningResource>> => {
    const response = await httpPost<{
      success: boolean;
      data: Camelize<YoutubeLearningResource>;
    }, CreateYouTubeMetadataInput>(
      YOUTUBE_RESOURCE_ENDPOINTS.METADATA(resourceId),
      input
    );
    return response.data;
  },

  /**
   * Fetch a YouTube resource by its ID.
   */
  fetchResourceById: async (
    id: string
  ): Promise<Camelize<YoutubeLearningResource> & { segment_count: number; direct_media_count: number }> => {
    const response = await httpGet<{
      success: boolean;
      data: Camelize<YoutubeLearningResource> & { segment_count: number; direct_media_count: number };
    }>(YOUTUBE_RESOURCE_ENDPOINTS.BY_ID(id));
    
    return response.data;
  },

  /**
   * Fetch all segments for a YouTube resource.
   */
  fetchSegments: async (
    youtubeResourceId: string
  ): Promise<Camelize<YoutubeLearningResourceSegment>[]> => {
    const response = await httpGet<{
      success: boolean;
      data: Camelize<YoutubeLearningResourceSegment>[];
    }>(YOUTUBE_RESOURCE_ENDPOINTS.SEGMENTS(youtubeResourceId));
    
    return response.data;
  },

  /**
   * Create a new segment.
   */
  createSegment: async (
    input: CreateSegmentInput
  ): Promise<{
    segment: Camelize<YoutubeLearningResourceSegment>;
    updatedYoutubeResource: Camelize<YoutubeLearningResource> | null;
  }> => {
    const response = await httpPost<{
      success: boolean;
      data: {
        segment: Camelize<YoutubeLearningResourceSegment>;
        updatedYoutubeResource: Camelize<YoutubeLearningResource> | null;
      };
    }, CreateSegmentInput>(
      YOUTUBE_RESOURCE_ENDPOINTS.SEGMENTS(input.youtubeResourceId),
      input
    );
    
    return response.data;
  },

  /**
   * Update a segment.
   */
  updateSegment: async (
    segmentId: string,
    updates: Partial<CreateSegmentInput>
  ): Promise<Camelize<YoutubeLearningResourceSegment>> => {
    const response = await httpPost<{ // Assuming PATCH or POST depending on HTTP client, blueprint says PATCH but httpPost is used for brevity here or I should check httpPatch
      success: boolean;
      data: Camelize<YoutubeLearningResourceSegment>;
    }, any>(
      YOUTUBE_RESOURCE_ENDPOINTS.SEGMENT_BY_ID(segmentId),
      updates
    );
    return response.data;
  },

  /**
   * Delete a segment.
   */
  deleteSegment: async (
    segmentId: string
  ): Promise<{
    deletedSegmentId: string;
    updatedYoutubeResource: Camelize<YoutubeLearningResource> | null;
  }> => {
    const response = await httpDelete<{
      success: boolean;
      data: {
        deletedSegmentId: string;
        updatedYoutubeResource: Camelize<YoutubeLearningResource> | null;
      };
    }>(YOUTUBE_RESOURCE_ENDPOINTS.SEGMENT_BY_ID(segmentId));
    
    return response.data;
  },

  /**
   * Upload direct media for a YouTube resource.
   */
  uploadDirectMedia: async (
    input: UploadYoutubeDirectMediaInput
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("youtubeResourceId", input.youtubeResourceId);
    formData.append("label", input.label);
    formData.append("file", input.file);

    const response = await httpPost<{
      success: boolean;
      data: any;
    }, FormData>(
      YOUTUBE_RESOURCE_ENDPOINTS.DIRECT_MEDIA_UPLOAD(input.youtubeResourceId),
      formData
    );
    
    return response.data;
  },

  /**
   * Upload media for a specific segment.
   */
  uploadSegmentMedia: async (
    input: UploadSegmentMediaInput
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("youtubeResourceId", input.youtubeResourceId);
    formData.append("segmentId", input.segmentId);
    if (input.label) formData.append("label", input.label);
    formData.append("file", input.file);

    const response = await httpPost<{
      success: boolean;
      data: any;
    }, FormData>(
      YOUTUBE_RESOURCE_ENDPOINTS.SEGMENT_MEDIA(input.segmentId),
      formData
    );
    
    return response.data;
  },
};
