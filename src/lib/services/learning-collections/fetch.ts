import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchLearningCollections,
  fetchLearningCollectionById,
  FetchLearningCollectionsFilters,
} from "@/lib/repositories/learning-collections";
import { LearningCollection } from "@/models";

export async function getLearningCollectionsService(
  supabase: SupabaseClient,
  filters?: FetchLearningCollectionsFilters
): Promise<LearningCollection[]> {
  const { data, error } = await fetchLearningCollections(supabase, filters);

  return handleSupabaseResult<LearningCollection[]>(
    { data, error },
    "lenient",
    "Learning Collections"
  );
}

export async function getLearningCollectionByIdService(
  supabase: SupabaseClient,
  id: string
): Promise<LearningCollection> {
  const { data, error } = await fetchLearningCollectionById(supabase, id);

  return handleSupabaseResult<LearningCollection>(
    { data, error },
    "strict",
    "Learning Collection"
  );
}
