export interface InterviewExperienceWithCompanyCollegeDetails {
  id: string;
  title?: string;
  content?: string;
  batch: string;
  placed_year: number;
  company_id: string;
  college_id: string;
  created_at: string;
  company_details: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
  } | null;
  college_details: {
    id: string;
    name: string;
  } | null;
}

export interface InterviewFilters {
  companyId?: string | null;
  batch?: string | null;
  placedYear?: number | null;
  collegeId?: string | null;
}
