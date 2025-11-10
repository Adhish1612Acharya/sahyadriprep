import { axiosClient } from "@/lib/axiosClient";
import { PROFILE_ENDPOINTS } from "@/constants/api-endpoints.constants";
import {
  StudentProfileUpdate,
  CollegeAdminProfileUpdate,
  SuperAdminProfileUpdate,
} from "@/lib/validations/profile.schema";

// ============================================
// TYPES
// ============================================

export type UserRole = "student" | "college_admin" | "super_admin";

export interface BaseProfile {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
}

export interface StudentProfile extends BaseProfile {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  college_id: string | null;
  usn: string | null;
  batch: string;
  branch: string | null;
  current_semester: number | null;
  current_cgpa: number | null;
  technical_skills: string[] | null;
  projects: any[] | null;
  internships: any[] | null;
  placement_status: "seeking" | "placed" | null;
  placed_company_id: string | null;
  package_lpa: number | null;
  linkedin_url: string | null;
  github_url: string | null;
  resume_url: string | null;
  profile_visibility: "public" | "private" | "college_only" | null;
}

export interface CollegeAdminProfile extends BaseProfile {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  college_id: string;
  designation: string | null;
  department: string | null;
  employee_id: string | null;
  permissions: {
    can_view_analytics?: boolean;
    can_manage_students?: boolean;
    can_upload_experiences?: boolean;
  } | null;
}

export interface SuperAdminProfile extends BaseProfile {
  // Limited fields for super admin
}

export type Profile = StudentProfile | CollegeAdminProfile | SuperAdminProfile;

export interface ProfileResponse {
  success: boolean;
  role: UserRole;
  profile: Profile;
}

export interface ProfileUpdateResponse {
  success: boolean;
  profile: Profile;
}

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
      PROFILE_ENDPOINTS.BASE
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
      PROFILE_ENDPOINTS.BASE,
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
      PROFILE_ENDPOINTS.BASE,
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
      PROFILE_ENDPOINTS.BASE,
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
