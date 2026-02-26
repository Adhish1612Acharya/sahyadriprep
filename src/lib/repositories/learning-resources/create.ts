import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningResource } from "@/models";
import { Snakelize } from "@/types";
import { LearningResourceCreateInput } from "@/lib/zod";


export async function createLearningResource(
  supabase: SupabaseClient,
  input: Snakelize<LearningResourceCreateInput>
): Promise<{ data: LearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningResources)
    .insert(input)
    .select()
    .single();

  return { data, error };
}
