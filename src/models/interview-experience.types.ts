import { College } from "./college";
import { Company } from "./company";

export type ExperienceSource = 'admin_upload' | 'student_self_upload';

export interface InterviewExperience {
  id: string;
  student_id?: string;
  student_name?: string;
  college_id: string;
  batch: string; // Format: "2023-2027"
  placed_year?: number;
  company_id?: string;
  media_id?: string;
  created_by?: string;
  source: ExperienceSource;
  created_at: string;
  updated_at: string;
}

// ✅ Extended interface with joined data for display
export interface InterviewExperienceWithDetails extends InterviewExperience {
  college?: College;
  company?: Company;
  student?: {
    id: string;
    full_name: string;
    email: string;
  };
  media?: {
    id: string;
    url: string;
    file_name?: string;
    file_type?: string;
  };
}