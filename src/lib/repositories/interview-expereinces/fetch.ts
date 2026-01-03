import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  InterviewExperienceWithCompanyCollegeDetails,
  InterviewFilters,
} from "./types";

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
    .from("interview_experiences")
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
