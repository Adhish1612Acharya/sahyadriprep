export interface ProfileRow {
  id: string;
  role: "student" | "college_admin" | "super_admin";
  email: string;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
}

export type CollegeAdminProfileRow = {
  id: string;
  college_id: string;
};
