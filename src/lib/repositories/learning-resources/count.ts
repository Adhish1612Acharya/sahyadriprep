import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";

/**
 * Counts the number of resources in a specific collection.
 * Used for auto-calculating the next position.
 */
export async function countLearningResourcesInCollection(
  supabase: SupabaseClient,
  collectionId: string
): Promise<{ count: number | null; error: any | null }> {
  const { count, error } = await supabase
    .from(TABLES.learningResources)
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  return { count, error };
}
