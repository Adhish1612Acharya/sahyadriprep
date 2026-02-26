import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningCollection } from "@/models";

export async function createLearningCollection(
  supabase: SupabaseClient,
  input: Partial<Omit<LearningCollection, "id" | "created_at" | "updated_at">>,
): Promise<{ data: any | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningCollections)
    .insert(input)
    .select()
    .single();

  return { data, error };
}
