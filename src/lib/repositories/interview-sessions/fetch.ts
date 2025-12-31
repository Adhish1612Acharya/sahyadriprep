import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function interviewSessionsCountForCompanyInCollege(
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
