import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  InterviewExpereinceWithMediaAndCompanyCollegeDetails,
  InterviewExperienceWithCompanyCollegeDetails,
  InterviewFilters,
} from "./types";
import { InterviewExperience } from "@/models";

export async function interviewExperiencesCountForCompanyInCollege(
  supabase: SupabaseClient,
  companyId: string,
  collegeId: string
): Promise<{ data: number | null; error: any }> {
  const { count, error } = await supabase
    .from(TABLES.interviewExperiences)
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("college_id", collegeId)
    .limit(1);

  const data = count || null;

  return { data, error };
}

export async function fetchInterviewExperiences(
  supabase: SupabaseClient,
  filters?: InterviewFilters
): Promise<{
  data: InterviewExperienceWithCompanyCollegeDetails[] | null;
  error: any;
}> {
  let query = supabase
    .from(TABLES.interviewExperiences)
    .select(
      `
      *,
      company_details:company_id(id, name, logo_url, industry),
      college_details:college_id(id, name)
    `
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.collegeId) query = query.eq("college_id", filters.collegeId);
  if (filters?.companyId) query = query.eq("company_id", filters.companyId);
  if (filters?.batch) query = query.eq("batch", filters.batch);
  if (filters?.placedYear) query = query.eq("placed_year", filters.placedYear);

  const { data, error } = await query;

  return { data, error };
}

export async function fetchInterviewExperienceByIdForCollege(
  supabase: SupabaseClient,
  interviewExperienceId: string,
  collegeId: string
): Promise<{
  data: InterviewExpereinceWithMediaAndCompanyCollegeDetails | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from(TABLES.interviewExperiences)
    .select(
      `
      *,
      company_details:company_id(id, name, logo_url, industry),
      college_details:college_id(id, name),
      document_media:document_media_id(id, url, file_name, file_type, file_size),
      video_media:video_media_id(id, url, file_name, file_type, file_size)
    `
    )
    .eq("id", interviewExperienceId)
    .eq("college_id", collegeId)
    .single();

  return { data, error };
}

export async function fetchInterviewExperienceOwnCreatedByIdForCollege(
  supabase: SupabaseClient,
  interviewExperienceId: string,
  collegeId: string,
  userId: string
): Promise<{
  data: InterviewExperience | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from(TABLES.interviewExperiences)
    .select("*")
    .eq("id", interviewExperienceId)
    .eq("college_id", collegeId)
    .eq("created_by", userId)
    .single();

  return { data, error };
}
