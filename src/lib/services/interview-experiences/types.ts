import {
  InterviewExperienceWithCompanyCollegeDetails,
  InterviewFilters,
} from "@/lib/repositories/interview-expereinces";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ListInterviewsParams {
  supabase: SupabaseClient;
  userId: string;
  filters?: InterviewFilters;
}

export interface ListInterviewsResult {
  count: number;
  interviewExperiences: InterviewExperienceWithCompanyCollegeDetails[];
}

export interface InterviewUploadData {
  studentName?: string | null;
  batch: string;
  placedYear?: number | null;
  companyId: string;
  source: string;
}

export interface CreateInterviewExperienceResult {
  experienceId: string;
  pdfMediaId: string;
  videoMediaId: string | null; // null if no video
  ragStatus: "COMPLETED" | "FAILED" | ""; // Your exact union
  ragChunksCount: number;
}
