import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  countLearningResourcesInCollection,
  fetchLearningResources,
  fetchSingleLearningResource,
} from "@/lib/repositories/learning-resources";
import { LearningResource } from "@/models";

export async function getLearningResourcesByCollectionService(
  supabase: SupabaseClient,
  collectionId: string,
  filters?: { type?: "image" | "youtube" | "document" },
): Promise<LearningResource[]> {
  const queryFilters: any = { collection_id: collectionId };

  if (filters?.type) {
    queryFilters.type = filters.type;
  }

  const { data, error } = await fetchLearningResources(supabase, queryFilters, {
    column: "position",
    ascending: true,
  });

  return handleSupabaseResult<LearningResource[]>(
    { data, error },
    "lenient",
    "Learning Resources",
  );
}

export async function getLearningResourceByIdService(
  supabase: SupabaseClient,
  id: string,
): Promise<LearningResource> {
  const { data, error } = await fetchSingleLearningResource(supabase, { id });

  return handleSupabaseResult<LearningResource>(
    { data, error },
    "strict",
    "Learning Resource",
  );
}

export async function getNextResourcePositionService(
  supabase: SupabaseClient,
  collectionId: string,
): Promise<number> {
  const { count, error } = await countLearningResourcesInCollection(
    supabase,
    collectionId,
  );

  const resourceCount = handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Learning Resources Count",
  );

  return resourceCount + 1;
}
