import { LEARNING_COLLECTION_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpDelete, httpGet, httpPost } from "@/lib/api/http";
import { LearningCollectionCreateInput } from "@/lib/zod";
import { LearningCollection } from "@/models/learning-collection.types";
import { Camelize } from "@/types";

export const learningCollectionApi = {
  /**
   * Fetch all collections owned by the authenticated user.
   */
  getAll: async (): Promise<Camelize<LearningCollection>[]> => {
    const response = await httpGet<{
      success: boolean;
      data: Camelize<LearningCollection>[];
    }>(LEARNING_COLLECTION_ENDPOINTS.BASE);

    return response.data;
  },

  /**
   * Fetch a single collection by ID.
   */
  getById: async (id: string): Promise<Camelize<LearningCollection>> => {
    const response = await httpGet<{
      success: boolean;
      data: Camelize<LearningCollection>;
    }>(LEARNING_COLLECTION_ENDPOINTS.BY_ID(id));

    return response.data;
  },

  /**
   * Create a new collection (multipart/form-data).
   */
  create: async (
    input: LearningCollectionCreateInput,
  ): Promise<Camelize<LearningCollection>> => {
    const formData = new FormData();

    formData.append("title", input.title);
    if (input.description) formData.append("description", input.description);
    if (input.thumbnail) formData.append("thumbnail", input.thumbnail);
    if (input.isPremium !== undefined)
      formData.append("isPremium", String(input.isPremium));
    if (input.visibility) formData.append("visibility", input.visibility);
    if (input.status) formData.append("status", input.status);

    const response = await httpPost<
      { success: boolean; data: Camelize<LearningCollection> },
      FormData
    >(LEARNING_COLLECTION_ENDPOINTS.BASE, formData);

    return response.data;
  },

  /**
   * Delete a collection by ID.
   */
  delete: async (id: string): Promise<{ id: string }> => {
    const response = await httpDelete<{
      success: boolean;
      data: { id: string };
    }>(LEARNING_COLLECTION_ENDPOINTS.BY_ID(id));

    return response.data;
  },

  /**
   * Publish a collection by ID.
   */
  publish: async (id: string): Promise<Camelize<LearningCollection>> => {
    const response = await httpPost<{
      success: boolean;
      data: Camelize<LearningCollection>;
    }>(LEARNING_COLLECTION_ENDPOINTS.PUBLISH(id), {});

    return response.data;
  },
};
