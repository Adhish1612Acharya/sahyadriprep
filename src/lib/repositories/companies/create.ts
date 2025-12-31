import { SupabaseClient } from "@supabase/supabase-js";
import { CreateCompanyInput } from "./types";
import { Company } from "@/models";
import { TABLES } from "@/constants/tables.constants";

export async function createCompany(
  supabase: SupabaseClient,
  input: CreateCompanyInput
): Promise<{ data: Company | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.companies)
    .insert([input])
    .select(
      `
      *,
      colleges(id, name)
    `
    )
    .single();

  return { data, error };
}
