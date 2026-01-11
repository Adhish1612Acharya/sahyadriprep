import {
  API_ENDPOINTS,
  PROFILE_ENDPOINTS,
} from "@/constants/api-endpoints.constants";
import {
  StudentProfileUpdate,
  CollegeAdminProfileUpdate,
  SuperAdminProfileUpdate,
} from "@/lib/zod/schema/profile.schema";
import {
  ProfileResponse,
  ProfileUpdateResponse,
} from "@/types/services/profile-service.types";
import { httpGet, httpPatch, httpPost } from "@/lib/api/http";

export const profileApi = {
  getMyProfile: async (): Promise<ProfileResponse> => {
    const response = await httpGet<ProfileResponse>(API_ENDPOINTS.PROFILE.BASE);
    return response;
  },

  updateStudentProfile: async (
    data: StudentProfileUpdate
  ): Promise<ProfileUpdateResponse> => {
    const response = await httpPatch<
      ProfileUpdateResponse,
      StudentProfileUpdate
    >(API_ENDPOINTS.PROFILE.BASE, data);
    return response;
  },

  updateCollegeAdminProfile: async (
    data: CollegeAdminProfileUpdate
  ): Promise<ProfileUpdateResponse> => {
    const response = await httpPatch<
      ProfileUpdateResponse,
      CollegeAdminProfileUpdate
    >(API_ENDPOINTS.PROFILE.BASE, data);
    return response;
  },

  updateSuperAdminProfile: async (
    data: SuperAdminProfileUpdate
  ): Promise<ProfileUpdateResponse> => {
    const response = await httpPatch<
      ProfileUpdateResponse,
      SuperAdminProfileUpdate
    >(API_ENDPOINTS.PROFILE.BASE, data);
    return response;
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await httpPost<{ avatar_url: string }, FormData>(
      PROFILE_ENDPOINTS.AVATAR,
      formData
    );
    return response;
  },

  uploadResume: async (file: File): Promise<{ resume_url: string }> => {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await httpPost<{ resume_url: string }, FormData>(
      PROFILE_ENDPOINTS.RESUME,
      formData
    );
    return response;
  },
};
