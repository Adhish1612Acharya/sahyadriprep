import { TABLES } from "@/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteCompanyForCollege(
  supabase: SupabaseClient,
  id: string,
  collegeId: string
): Promise<void> {
  const { error } = await supabase.from(TABLES.companies)
  .delete()
  .eq("id", id)
  .eq("college_id", collegeId);

  if (error) throw new Error(`Failed to delete company: ${error.message}`);
}
