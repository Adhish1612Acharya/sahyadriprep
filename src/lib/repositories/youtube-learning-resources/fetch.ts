import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResource } from "@/models";

/**
 * Fetch a single YouTube learning resource by its primary ID.
 */
export async function fetchYoutubeLearningResourceById(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: YoutubeLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

/**
 * Fetch a single YouTube learning resource by its parent resource ID.
 */
export async function fetchYoutubeLearningResourceByResourceId(
  supabase: SupabaseClient,
  resourceId: string
): Promise<{ data: YoutubeLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResources)
    .select("*")
    .eq("resource_id", resourceId)
    .single();

  return { data, error };
}

export async function fetchYoutubeLearningResources(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResource> = {},
) {
  let query = supabase.from(TABLES.youtubeLearningResources).select("*");
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const { data, error } = await query;
  return { data, error };
}
