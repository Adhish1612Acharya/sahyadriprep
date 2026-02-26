import { LEARNING_RESOURCE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpGet, httpPost } from "@/lib/api/http";
import { LearningResourceCreateInput } from "@/lib/zod";
import { LearningResource } from "@/models/learning-resource.types";
import { Camelize } from "@/types";

export interface DirectMediaUploadInput {
  resourceId: string;
  label: string;
  file: File;
}

export interface DirectMediaUploadResult {
  resource: Camelize<LearningResource>;
  media: {
    id: string;
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

export const learningResourceApi = {
  /**
   * Create a resource registry entry (metadata only, no file).
   * Sends JSON body.
   */
  createResource: async (
    input: LearningResourceCreateInput
  ): Promise<Camelize<LearningResource>> => {
    const response = await httpPost<
      { success: boolean; data: Camelize<LearningResource> },
      LearningResourceCreateInput
    >(LEARNING_RESOURCE_ENDPOINTS.BASE, input);

    return response.data;
  },

  /**
   * Fetch all resources belonging to a collection.
   */
  fetchResourcesByCollection: async (
    collectionId: string
  ): Promise<Camelize<LearningResource>[]> => {
    const response = await httpGet<{
      success: boolean;
      data: Camelize<LearningResource>[];
    }>(LEARNING_RESOURCE_ENDPOINTS.BY_COLLECTION(collectionId));

    return response.data;
  },

  /**
   * Upload a direct-media file (image / PDF) and attach it to a resource.
   * Sends multipart/form-data.
   */
  uploadDirectMedia: async (
    input: DirectMediaUploadInput
  ): Promise<DirectMediaUploadResult> => {
    const formData = new FormData();
    formData.append("resourceId", input.resourceId);
    formData.append("label", input.label);
    formData.append("file", input.file);

    const response = await httpPost<
      { success: boolean; data: DirectMediaUploadResult },
      FormData
    >(LEARNING_RESOURCE_ENDPOINTS.DIRECT_MEDIA, formData);

    return response.data;
  },
};
