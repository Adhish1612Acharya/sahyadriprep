import { AuthProfile, StudentProfile } from "@/models";

export interface getAdminCollegeStudentsType {
  authProfile: AuthProfile;
  studentProfile: StudentProfile | null;
}
