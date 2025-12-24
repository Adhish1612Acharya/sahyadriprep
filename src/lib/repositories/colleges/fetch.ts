import type { SupabaseClient } from "@supabase/supabase-js";
import { CollegeRow } from "./college.types";


export async function fetchCollegeById(
  supabase: SupabaseClient,
  collegeId: string
): Promise<CollegeRow | null> {
  const { data, error } = await supabase
    .from("colleges")
    .select("id, email_domain")
    .eq("id", collegeId)
    .single();

  if (error || !data) return null;
  return data as CollegeRow;
}
