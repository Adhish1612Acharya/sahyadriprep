import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";

export async function deleteLearningCollection(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: { id: string } | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningCollections)
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  return { data, error };
}
