import { axiosClient } from "@/lib/axiosClient";
import { Exam } from "@/models/exam.types";
import { EXAM_ENDPOINTS } from "@/constants/api-endpoints.constants";

export const examService = {
  getAll: async (): Promise<Exam[]> => {
    const response = await axiosClient.get(EXAM_ENDPOINTS.BASE);
    return response.data;
  },

  getById: async (id: string): Promise<Exam> => {
    const response = await axiosClient.get(EXAM_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  create: async (data: Omit<Exam, "id" | "created_at">): Promise<Exam> => {
    const response = await axiosClient.post(EXAM_ENDPOINTS.BASE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Exam>): Promise<Exam> => {
    const response = await axiosClient.put(EXAM_ENDPOINTS.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(EXAM_ENDPOINTS.BY_ID(id));
  },

  getBySubject: async (subjectId: string): Promise<Exam[]> => {
    const response = await axiosClient.get(
      EXAM_ENDPOINTS.BY_SUBJECT(subjectId)
    );
    return response.data;
  },
};
