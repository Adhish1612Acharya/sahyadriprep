import { InterviewSession } from "@/models/interview-session.types";

export interface InterviewSessionWithCollegeAndCompanyDetails
  extends InterviewSession {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  company_id: string;
  college_id: string;
  created_at: string;
  companies: { id: string; name: string; logo_url: string | null };
  colleges: { id: string; name: string };
}

export interface InterviewSessionFilters {
  companyId?: string;
}
