import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { LearningCollection } from "@/models";

export interface FetchLearningCollectionsFilters {
  createdBy?: string;
  status?: LearningCollection["status"];
  visibility?: LearningCollection["visibility"];
}

export async function fetchLearningCollections(
  supabase: SupabaseClient,
  filters?: FetchLearningCollectionsFilters
): Promise<{ data: LearningCollection[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.learningCollections)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.createdBy) query = query.eq("created_by", filters.createdBy);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.visibility) query = query.eq("visibility", filters.visibility);

  const { data, error } = await query;
  return { data, error };
}

export async function fetchLearningCollectionById(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: LearningCollection | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.learningCollections)
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}
