import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

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
