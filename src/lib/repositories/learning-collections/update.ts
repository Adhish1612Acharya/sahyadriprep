import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningCollection } from "@/models";


export async function updateLearningCollection(
  supabase: SupabaseClient,
  filters: Partial<LearningCollection>,
  updates: Partial<Omit<LearningCollection, "id" | "created_at" | "updated_at">>
): Promise<{ data: LearningCollection | null; error: any | null }> {
  let query = supabase.from(TABLES.learningCollections).update(updates);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query = query.eq(key, value);
    }
  });

  const { data, error } = await query.select().single();

  return { data, error };
}
