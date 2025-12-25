export interface StudentRow {
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
  current_cgpa: number | null; // numeric(3,2)
  technical_skills: string[] | null;
  projects: unknown[]; // jsonb default '[]'::jsonb
  internships: unknown[]; // jsonb default '[]'::jsonb
  placement_status: string | null; // e.g. 'seeking'
  placed_company_id: string | null;
  package_lpa: number | null; // numeric(10,2)
  linkedin_url: string | null;
  github_url: string | null;
  resume_url: string | null;
  profile_visibility: string | null; // e.g. 'public'
  created_at: string | null;
  updated_at: string | null;
}
