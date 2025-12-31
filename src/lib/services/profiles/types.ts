import { AuthProfile, CollegeAdminProfile, StudentProfile } from "@/models";

export type CompleteProfileResult = {
  profile: StudentProfile | CollegeAdminProfile | AuthProfile;
  role: "student" | "college_admin" | "super_admin";
};

