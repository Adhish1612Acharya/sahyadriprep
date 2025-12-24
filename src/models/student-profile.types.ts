export interface StudentProfile {
  id: string;
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
  projects: any[]; // JSONB - use specific type if structure known
  internships: any[]; // JSONB - use specific type if structure known
  placement_status: "seeking" | "placed" | null;
  placed_company_id: string | null;
  package_lpa: number | null;
  linkedin_url: string | null;
  github_url: string | null;
  resume_url: string | null;
  profile_visibility: "public" | "private" | null;
  created_at: Date | null;
  updated_at: Date | null;
}
