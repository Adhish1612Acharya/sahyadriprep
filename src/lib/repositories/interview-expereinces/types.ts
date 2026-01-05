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

export interface InterviewExpereinceWithMediaAndCompanyCollegeDetails extends InterviewExperienceWithCompanyCollegeDetails {
  document_media: {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  } | null;
  video_media: {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  } | null;
}

export interface InterviewFilters {
  companyId?: string | null;
  batch?: string | null;
  placedYear?: number | null;
  collegeId?: string | null;
}

export interface InterviewExperienceCreateInput {
  student_id?: string | null; 
  student_name?: string | null;
  college_id: string; 
  company_id: string; 
  batch: string; 
  placed_year?: number | null;
  document_media_id: string; 
  video_media_id?: string | null; 
  source: string;
  created_by: string; 
}
