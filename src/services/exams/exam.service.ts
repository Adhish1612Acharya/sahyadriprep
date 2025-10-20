import { axiosClient } from "@/lib/axiosClient";
import { Exam } from "@/models/exam";

export const examService = {
  getAll: async (): Promise<Exam[]> => {
    const response = await axiosClient.get("/exams");
    return response.data;
  },

  create: async (data: Omit<Exam, "id" | "created_at">): Promise<Exam> => {
    const response = await axiosClient.post("/exams", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Exam>): Promise<Exam> => {
    const response = await axiosClient.put(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/exams/${id}`);
  },
};
