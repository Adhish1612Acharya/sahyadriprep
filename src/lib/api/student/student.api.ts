import { axiosClient } from "@/lib/axiosClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { getAdminCollegeStudentsType } from "./student.api.types";

export const studentApi = {
  getAdminCollegeStudents: async (): Promise<{
    data: getAdminCollegeStudentsType[];
  }> => {
    const response = await axiosClient.get<{
      data: getAdminCollegeStudentsType[];
    }>(API_ENDPOINTS.STUDENT.GET);
        
    return response.data;
  },
};
