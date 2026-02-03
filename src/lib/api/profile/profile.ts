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
import { Camelize } from "@/types";

export const profileApi = {
  getMyProfile: async (): Promise<Camelize<ProfileResponse>> => {
    const response = await httpGet<Camelize<ProfileResponse>>(
      API_ENDPOINTS.PROFILE.BASE,
    );
    return response;
  },

  updateStudentProfile: async (
    data: StudentProfileUpdate,
  ): Promise<Camelize<ProfileUpdateResponse>> => {
    const response = await httpPatch<
      Camelize<ProfileUpdateResponse>,
      StudentProfileUpdate
    >(API_ENDPOINTS.PROFILE.BASE, data);
    return response;
  },

  updateCollegeAdminProfile: async (
    data: CollegeAdminProfileUpdate,
  ): Promise<Camelize<ProfileUpdateResponse>> => {
    const response = await httpPatch<
      Camelize<ProfileUpdateResponse>,
      CollegeAdminProfileUpdate
    >(API_ENDPOINTS.PROFILE.BASE, data);
    return response;
  },

  updateSuperAdminProfile: async (
    data: SuperAdminProfileUpdate,
  ): Promise<Camelize<ProfileUpdateResponse>> => {
    const response = await httpPatch<
      Camelize<ProfileUpdateResponse>,
      SuperAdminProfileUpdate
    >(API_ENDPOINTS.PROFILE.BASE, data);
    return response;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await httpPost<{ avatarUrl: string }, FormData>(
      PROFILE_ENDPOINTS.AVATAR,
      formData,
    );
    return response;
  },

  uploadResume: async (file: File): Promise<{ resumeUrl: string }> => {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await httpPost<{ resumeUrl: string }, FormData>(
      PROFILE_ENDPOINTS.RESUME,
      formData,
    );
    return response;
  },
};
