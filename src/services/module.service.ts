import { axiosClient } from "@/lib/axiosClient";
import { Module } from "@/models/module.types";

export const moduleService = {
  getAll: async (): Promise<Module[]> => {
    const response = await axiosClient.get("/modules");
    return response.data;
  },

  getBySubjectId: async (subjectId: string): Promise<Module[]> => {
    const response = await axiosClient.get(`/modules?subject_id=${subjectId}`);
    return response.data;
  },

  create: async (data: Omit<Module, "id" | "created_at">): Promise<Module> => {
    const response = await axiosClient.post("/modules", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Module>): Promise<Module> => {
    const response = await axiosClient.put(`/modules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/modules/${id}`);
  },
};
