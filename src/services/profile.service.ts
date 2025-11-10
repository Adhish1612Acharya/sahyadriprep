import { axiosClient } from "@/lib/axiosClient";
import {
  API_ENDPOINTS,
  PROFILE_ENDPOINTS,
} from "@/constants/api-endpoints.constants";
import {
  StudentProfileUpdate,
  CollegeAdminProfileUpdate,
  SuperAdminProfileUpdate,
} from "@/lib/validations/profile.schema";
import {
  ProfileResponse,
  ProfileUpdateResponse,
} from "@/types/services/profile-service.types";

// ============================================
// SERVICE (API CALLS ONLY)
// ============================================

/**
 * Profile Service - API Calls Only
 */
export const profileService = {
  /**
   * Get current user's profile
   */
  getMyProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosClient.get<ProfileResponse>(
      API_ENDPOINTS.PROFILE.BASE
    );
    return response.data;
  },

  /**
   * Update student profile
   */
  updateStudentProfile: async (
    data: StudentProfileUpdate
  ): Promise<ProfileUpdateResponse> => {
    const response = await axiosClient.patch<ProfileUpdateResponse>(
      API_ENDPOINTS.PROFILE.BASE,
      data
    );
    return response.data;
  },

  /**
   * Update college admin profile
   */
  updateCollegeAdminProfile: async (
    data: CollegeAdminProfileUpdate
  ): Promise<ProfileUpdateResponse> => {
    
    const response = await axiosClient.patch<ProfileUpdateResponse>(
      API_ENDPOINTS.PROFILE.BASE,
      data
    );
    return response.data;
  },

  /**
   * Update super admin profile
   */
  updateSuperAdminProfile: async (
    data: SuperAdminProfileUpdate
  ): Promise<ProfileUpdateResponse> => {
    const response = await axiosClient.patch<ProfileUpdateResponse>(
      API_ENDPOINTS.PROFILE.BASE,
      data
    );
    return response.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosClient.post<{ avatar_url: string }>(
      PROFILE_ENDPOINTS.AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Upload resume
   */
  uploadResume: async (file: File): Promise<{ resume_url: string }> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await axiosClient.post<{ resume_url: string }>(
      PROFILE_ENDPOINTS.RESUME,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
