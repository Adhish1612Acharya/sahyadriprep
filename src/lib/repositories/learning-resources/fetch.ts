import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningResource } from "@/models";

/**
 * Atomic fetch for multiple learning resources with arbitrary filters and ordering.
 */
export async function fetchLearningResources(
  supabase: SupabaseClient,
  filters: Partial<LearningResource> = {},
  orderBy?: { column: string; ascending?: boolean }
): Promise<{ data: LearningResource[] | null; error: any | null }> {
  let query = supabase.from(TABLES.learningResources).select("*").match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Atomic fetch for a single learning resource with arbitrary filters.
 */
export async function fetchSingleLearningResource(
  supabase: SupabaseClient,
  filters: Partial<LearningResource>
): Promise<{ data: LearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningResources)
    .select("*")
    .match(filters)
    .single();

  return { data, error };
}