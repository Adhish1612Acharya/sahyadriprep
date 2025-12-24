export interface CollegeAdminProfile {
  // Primary key
  id: string; // UUID, references auth.users(id)

  // Profile information
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;

  // College relationship
  college_id: string; // UUID, references colleges(id)

  // Job information
  designation: string | null;
  department: string | null;
  employee_id: string | null;

  // Permissions (JSONB)
  permissions: CollegeAdminPermissions | null;

  // Timestamps
  created_at: string | Date | null; // ISO 8601 string or Date
  updated_at: string | Date | null; // ISO 8601 string or Date
}

/**
 * Permissions structure for college admins
 */
export interface CollegeAdminPermissions {
  can_view_analytics: boolean;
  can_manage_students: boolean;
  can_upload_experiences: boolean;
  [key: string]: boolean; // Allow additional permissions
}

/**
 * For creating a new college admin profile (omit id, created_at, updated_at)
 */
export type CreateCollegeAdminProfileInput = Omit<
  CollegeAdminProfile,
  "id" | "created_at" | "updated_at"
>;

/**
 * For updating a college admin profile
 */
export type UpdateCollegeAdminProfileInput = Partial<
  Omit<CollegeAdminProfile, "id" | "created_at" | "updated_at">
>;
