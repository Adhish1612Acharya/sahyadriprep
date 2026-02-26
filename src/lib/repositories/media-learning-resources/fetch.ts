import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { MediaLearningResource } from "@/models";

export async function fetchSingleMediaLearningResource(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>
): Promise<{ data: MediaLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.mediaLearningResources)
    .select("*")
    .match(filters)
    .single();
  return { data, error };
}

export async function fetchMediaLearningResources(
  supabase: SupabaseClient,
  filters: Partial<MediaLearningResource>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<{ data: MediaLearningResource[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.mediaLearningResources)
    .select("*")
    .match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  }

  const { data, error } = await query;
  return { data, error };
}