import { axiosClient } from "@/lib/axiosClient";
import { INTERVIEW_EXPERIENCE_ENDPOINTS } from "@/constants/api-endpoints.constants";

export interface CreateInterviewExperienceInput {
  document: File;
  video_preview?: File;
  studentName?: string;
  college_id: string;
  company_id: string;
  batch: string;
  placedYear?: number;
}

export interface InterviewExperienceResponse {
  success: boolean;
  message: string;
  data: {
    experience_id: string;
    media_id: string;
    video_media_id: string | null;
    college_id: string;
    company_id: string;
    chunks_stored: number;
    cloudinary_url: string;
    video_url: string | null;
  };
}

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
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Get all interview experiences
   */
  getAll: async (): Promise<any[]> => {
    const response = await axiosClient.get(INTERVIEW_EXPERIENCE_ENDPOINTS.BASE);
    return response.data;
  },

  /**
   * Get interview experience by ID
   */
  getById: async (id: string): Promise<any> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Get by college
   */
  getByCollege: async (collegeId: string): Promise<any[]> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_COLLEGE(collegeId)
    );
    return response.data;
  },

  /**
   * Get by company
   */
  getByCompany: async (companyId: string): Promise<any[]> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_COMPANY(companyId)
    );
    return response.data;
  },

  /**
   * Get by batch
   */
  getByBatch: async (batch: string): Promise<any[]> => {
    const response = await axiosClient.get(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_BATCH(batch)
    );
    return response.data;
  },

  /**
   * Delete interview experience
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(INTERVIEW_EXPERIENCE_ENDPOINTS.BY_ID(id));
  },
};
