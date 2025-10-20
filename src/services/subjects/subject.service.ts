import { axiosClient } from "@/lib/axiosClient";
import { Subject } from "@/models/subject";

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    const res = await axiosClient.get("/subjects");
    return res.data;
  },
  create: async (data: Omit<Subject, "id">): Promise<Subject> => {
    const res = await axiosClient.post("/subjects", data);
    return res.data;
  },
  update: async (id: string, data: Partial<Subject>): Promise<Subject> => {
    const res = await axiosClient.put(`/subjects/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/subjects/${id}`);
  },
};
