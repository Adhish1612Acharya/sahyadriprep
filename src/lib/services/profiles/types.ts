import { AuthProfile, CollegeAdminProfile, StudentProfile } from "@/models";

export type CompleteProfileResult =
  | { type: "error"; error: string }
  | { type: "success"; role: "student"; profile: StudentProfile }
  | { type: "success"; role: "college_admin"; profile: CollegeAdminProfile }
  | { type: "success"; role: "super_admin"; profile: AuthProfile };

export type UpdateProfileResult =
  | {
      type: "success";
      role: string;
      profile: StudentProfile | CollegeAdminProfile | null;
    }
  | { type: "error"; error: string };
