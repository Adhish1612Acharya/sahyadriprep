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

export interface InterviewSessionCreateParams {
  video_id: string;
  video_url: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration?: number;
  company_id: string;
  college_id: string;
  created_by: string;
}

export interface InterviewSessionAIMetadata {
  last_processed_at: string;
  processing_time_ms: number;
  ai_model: string;
  counts: {
    segments: number;
    flashcards: number;
    tips: number;
  };
}

export interface InterviewSessionAIProcessUpdateRecord {
  ai_process_done: boolean;
  ai_process_count: number;
  ai_process_metadata: InterviewSessionAIMetadata;
  updated_at: string;
}
