import { TABLES } from "@/constants";
import { Company } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateCompanyScopedToCollege(
  supabase: SupabaseClient,
  companyId: string,
  collegeId: string,
  updateData: Record<string, unknown>
): Promise<Company> {
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

  if (error) {
    if (error.code === "23505") {
      // unique violation
      const e = new Error("A company with this name already exists");
      (e as any).code = "DUPLICATE_NAME";
      throw e;
    }
    throw new Error(`Failed to update company: ${error.message}`);
  }

  return data as Company;
}
