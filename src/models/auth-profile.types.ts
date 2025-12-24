export interface AuthProfile {
  id: string;
  role: "student" | "college_admin" | "super_admin";
  created_at: Date | null;
  updated_at: Date | null;
  profile_completed: boolean;
  college_id: string;
  email: string | null;
}
