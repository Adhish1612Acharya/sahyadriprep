import { User } from "@supabase/supabase-js";

export interface ProfileData {
  full_name: string;
  avatar_url?: string;
  college_id?: string;
  batch?: string;
  branch?: string;
  designation?: string;
}

export type Role = "student" | "college_admin" | "super_admin" | null;

export interface AuthContextType {
  user: User | null;
  role: Role;
  profileData: ProfileData | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
}
