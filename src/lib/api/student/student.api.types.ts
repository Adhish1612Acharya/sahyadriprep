export interface studentAuthProfile {
  id: string;
  role: "student" | "college_admin" | "super_admin";
  email: string;
  createdAt: string;
  updatedAt: string;
  profileCompleted: boolean;
}

export interface studentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  collegeId: string | null;
  usn: string | null;
  batch: string;
  branch: string | null;
  currentSemester: number | null;
  currentCgpa: number | null; // numeric(3,2)
  technicalSkills: string[] | null;
  projects: unknown[]; // jsonb default '[]'::jsonb
  internships: unknown[]; // jsonb default '[]'::jsonb
  placementStatus: string | null; // e.g. 'seeking'
  placedCompanyId: string | null;
  packageLpa: number | null; // numeric(10,2)
  linkedinUrl: string | null;
  githubUrl: string | null;
  resumeUrl: string | null;
  profileVisibility: string | null; // e.g. 'public'
  createdAt: string | null;
  updatedAt: string | null;
}

export interface getAdminCollegeStudentsType {
  authProfile: studentAuthProfile;
  studentProfile: studentProfile | null;
}
