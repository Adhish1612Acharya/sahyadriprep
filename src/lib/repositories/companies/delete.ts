import { TABLES } from "@/constants";
import { Company } from "@/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteCompanyForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<{ data: Company | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .delete()
    .eq("id", id)
    .eq("college_id", collegeId);

  return { data, error };
}
