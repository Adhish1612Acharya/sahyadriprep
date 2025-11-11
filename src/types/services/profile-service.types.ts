// ============================================
// TYPES
// ============================================

// import { SuperAdminProfile } from "@/types/services/profile-service.types";

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

export type Profile = StudentProfile | CollegeAdminProfile;

export interface ProfileResponse {
  success: boolean;
  role: UserRole;
  profile: Profile;
}

export interface ProfileUpdateResponse {
  success: boolean;
  profile: Profile;
}
