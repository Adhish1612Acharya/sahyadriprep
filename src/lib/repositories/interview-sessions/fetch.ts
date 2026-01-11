import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  InterviewSessionFilters,
  InterviewSessionWithCollegeAndCompanyDetails,
} from "@/lib/repositories/interview-sessions";

export async function fetchInterviewSessionsCountForCompanyInCollege(
  supabase: SupabaseClient,
  companyId: string,
  collegeId: string
): Promise<{ data: number | null; error: any | null }> {
  const { count, error } = await supabase
    .from(TABLES.interviewSessions)
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("college_id", collegeId);

  const data = count || null;

  return { data, error };
}

export async function fetchInterviewSessionsForCollege(
  supabase: SupabaseClient,
  filters: InterviewSessionFilters,
  collegeId: string
): Promise<{
  data: InterviewSessionWithCollegeAndCompanyDetails[];
  error: any;
}> {
  let query = supabase
    .from(TABLES.interviewSessions)
    .select(
      `
      *,
      companies:company_id(id, name, logo_url),
      colleges:college_id(id, name)
    `
    )
    .eq("college_id", collegeId)
    .order("created_at", { ascending: false });

  if (filters.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function fetchInterviewSessionForCollegeFromYouTubeVideoId(
  supabase: SupabaseClient,
  videoId: string,
  collegeId: string
): Promise<{
  data: InterviewSessionWithCollegeAndCompanyDetails | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessions)
    .select(
      `
      *,
      companies:company_id(id, name, logo_url),
      colleges:college_id(id, name)
    `
    )
    .eq("college_id", collegeId)
    .eq("video_id", videoId)
    .single();

  return { data, error };
}

export async function fetchInterviewSessionDetailsForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<{
  data: InterviewSessionWithCollegeAndCompanyDetails | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessions)
    .select(
      `
      *,
      companies:company_id(id, name, logo_url),
      colleges:college_id(id, name)
    `
    )
    .eq("college_id", collegeId)
    .eq("id", id)
    .single();

  return { data, error };
}
