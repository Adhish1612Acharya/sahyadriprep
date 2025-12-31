import { TABLES } from "@/constants";
import { Company } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateCompanyScopedToCollege(
  supabase: SupabaseClient,
  companyId: string,
  collegeId: string,
  updateData: Record<string, unknown>
): Promise<{ data: Company | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", companyId)
    .eq("college_id", collegeId)
    .select("*")
    .single();

  return { data, error };
}
