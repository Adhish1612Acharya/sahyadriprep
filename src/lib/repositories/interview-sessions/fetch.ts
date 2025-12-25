import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function hasInterviewSessionsForCompanyInCollege(
  supabase: SupabaseClient,
  companyId: string,
  collegeId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLES.interviewSessions)
    .select("id")
    .eq("company_id", companyId)
    .eq("college_id", collegeId)
    .limit(1);

  if (error)
    throw new Error(`Failed to check YouTube videos: ${error.message}`);
  return data?.length > 0;
}
