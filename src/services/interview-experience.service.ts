import { INTERVIEW_EXPERIENCE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import {
  CreateInterviewExperienceInput,
  InterviewExperience,
  InterviewExperienceResponse,
} from "@/types/services/interview-experience.types";
import { InterviewExperienceFormValues } from "@/lib/zod/schema/interview-experience.schema";
import { httpGet, httpPost, httpDelete } from "@/lib/api/http";

export const interviewExperienceService = {
  create: async (
    input: CreateInterviewExperienceInput
  ): Promise<InterviewExperienceResponse> => {
    const formData = new FormData();
    formData.append("document", input.document);
    formData.append("college_id", input.college_id);
    formData.append("company_id", input.company_id);
    formData.append("batch", input.batch);
    if (input.video_preview)
      formData.append("video_preview", input.video_preview);
    if (input.studentName) formData.append("studentName", input.studentName);
    if (input.placedYear)
      formData.append("placedYear", input.placedYear.toString());
    const response = await httpPost<InterviewExperienceResponse, FormData>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BASE,
      formData
    );
    return response;
  },

  sendExperience: async (input: InterviewExperienceFormValues) => {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      if (key === "resume" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });
    const response = await httpPost<any, FormData>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.SEND,
      formData
    );
    return response;
  },

  getAll: async (filters?: {
    company_id?: string;
    college_id?: string;
    batch?: string;
    placed_year?: number;
  }): Promise<InterviewExperience[]> => {
    const params = new URLSearchParams();
    if (filters?.company_id) params.append("company_id", filters.company_id);
    if (filters?.college_id) params.append("college_id", filters.college_id);
    if (filters?.batch) params.append("batch", filters.batch);
    if (filters?.placed_year)
      params.append("placed_year", filters.placed_year.toString());
    const response = await httpGet<{
      success: boolean;
      count: number;
      interviewExperiences: InterviewExperience[];
    }>(`/interview-experiences?${params.toString()}`);
    return response.interviewExperiences;
  },

  getById: async (id: string): Promise<any> => {
    const response = await httpGet<{ data: any }>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_ID(id)
    );
    return response.data;
  },

  getByCollege: async (collegeId: string): Promise<InterviewExperience[]> => {
    const response = await httpGet<{ data: InterviewExperience[] }>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_COLLEGE(collegeId)
    );
    return response.data;
  },

  getByCompany: async (companyId: string): Promise<InterviewExperience[]> => {
    const response = await httpGet<{ data: InterviewExperience[] }>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_COMPANY(companyId)
    );
    return response.data;
  },

  getByBatch: async (batch: string): Promise<InterviewExperience[]> => {
    const response = await httpGet<{ data: InterviewExperience[] }>(
      INTERVIEW_EXPERIENCE_ENDPOINTS.BY_BATCH(batch)
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await httpDelete(INTERVIEW_EXPERIENCE_ENDPOINTS.BY_ID(id));
  
  },
};
