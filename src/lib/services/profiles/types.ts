import { AuthProfile, CollegeAdminProfile, StudentProfile } from "@/models";

// Discriminated union for stricter typing
export type CompleteProfileResult =
  | {
      profile: StudentProfile;
      role: "student";
    }
  | {
      profile: CollegeAdminProfile;
      role: "college_admin";
    }
  | {
      profile: AuthProfile;
      role: "super_admin";
    };
