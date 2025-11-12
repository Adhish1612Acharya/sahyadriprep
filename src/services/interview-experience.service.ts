import { axiosClient } from "@/lib/axiosClient";
import { INTERVIEW_EXPERIENCE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import {
  CreateInterviewExperienceInput,
  InterviewExperience,
  InterviewExperienceResponse,
} from "@/types/services/interview-experience.types";

export const interviewExperienceService = {
  /**
   * Create a new interview experience (Admin upload)
   */
  create: async (
    input: CreateInterviewExperienceInput
  ): Promise<InterviewExperienceResponse> => {
    const formData = new FormData();

    formData.append("document", input.document);
    formData.append("college_id", input.college_id);
    formData.append("company_id", input.company_id);
    formData.append("batch", input.batch);

    if (input.video_preview) {
      formData.append("video_preview", input.video_preview);
    }

    if (input.studentName) {
      formData.append("studentName", input.studentName);
    }

    if (input.placedYear) {
      formData.append("placedYear", input.placedYear.toString());
    }

    const response = await axiosClient.post<InterviewExperienceResponse>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BASE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
           
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Get all interview experiences with optional filters
   */
  getAll: async (filters?: {
    company_id?: string;
    college_id?: string;
    batch?: string;
    placed_year?: number;
  }): Promise<InterviewExperience[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.company_id) params.append("company_id", filters.company_id);
      if (filters?.college_id) params.append("college_id", filters.college_id);
      if (filters?.batch) params.append("batch", filters.batch);
      if (filters?.placed_year)
        params.append("placed_year", filters.placed_year.toString());

      const response = await axiosClient.get<{
        success: boolean;
        count: number;
        data: InterviewExperience[];
      }>(`/interview-experiences?${params.toString()}`);

      // ✅ Return just the data array
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching interview experiences:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch interview experiences"
      );
    }
  },

  /**
   * Get interview experience by ID
   */
  getById: async (id: string): Promise<any> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_ID(id)
    );
    return response.data.data;
  },

  /**
   * Get by college
   */
  getByCollege: async (collegeId: string): Promise<InterviewExperience[]> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_COLLEGE(collegeId)
    );
    // ✅ Return just the data array
    return response.data.data || response.data;
  },

  /**
   * Get by company
   */
  getByCompany: async (companyId: string): Promise<InterviewExperience[]> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_COMPANY(companyId)
    );
    // ✅ Return just the data array
    return response.data.data || response.data;
  },

  /**
   * Get by batch
   */
  getByBatch: async (batch: string): Promise<InterviewExperience[]> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_BATCH(batch)
    );
    // ✅ Return just the data array
    return response.data.data || response.data;
  },

  /**
   * Delete interview experience
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(INTERVIEW_EXPERIENCE_ENDPOINTS.BY_ID(id));
  },
};
