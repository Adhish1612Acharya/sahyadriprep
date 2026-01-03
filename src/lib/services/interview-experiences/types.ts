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
