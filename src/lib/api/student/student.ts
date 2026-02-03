import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { getAdminCollegeStudentsType } from "@/lib/api/student/types";
import { httpGet } from "@/lib/api/http";
import { Camelize } from "@/types";

export const studentApi = {
  getAdminCollegeStudents: async (): Promise<
    Camelize<getAdminCollegeStudentsType>[]
  > => {
    const response = await httpGet<{
      success: true;
      data: Camelize<getAdminCollegeStudentsType>[];
    }>(API_ENDPOINTS.STUDENT.GET);
    return response.data;
  },
};
