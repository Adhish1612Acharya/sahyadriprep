import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { getAdminCollegeStudentsType } from "@/lib/api/student/types";
import { httpGet } from "@/lib/api/http";

export const studentApi = {
  getAdminCollegeStudents: async (): Promise<getAdminCollegeStudentsType[]> => {
    const response = await httpGet<getAdminCollegeStudentsType[]>(
      API_ENDPOINTS.STUDENT.GET
    );
    return response;
  },
};
