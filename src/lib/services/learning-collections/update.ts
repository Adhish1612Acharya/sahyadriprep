import { updateLearningCollection } from "@/lib/repositories/learning-collections";
import { handleSupabaseResult } from "@/helpers/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { LearningCollection } from "@/models";
import { toSnakeCase } from "@/helpers/transformers";
import { Camelize } from "@/types";

export async function updateLearningCollectionThumbnailService(
  supabase: SupabaseClient,
  id: string,
  input :{ thumbnailMediaId: string },
): Promise<LearningCollection> {
  const { data, error } = await updateLearningCollection(
    supabase,
    { id },
    toSnakeCase(input),
  );

  return handleSupabaseResult<LearningCollection>(
    { data, error },
    "lenient",
    "Learning Collection",
  );
}

export async function updateLearningCollectionService(
  supabase: SupabaseClient,
  id: string,
  input: Partial<Omit<Camelize<LearningCollection>, "id" | "createdAt" | "updatedAt" | "createdBy">>
): Promise<LearningCollection> {
  const { data, error } = await updateLearningCollection(
    supabase,
    { id },
    toSnakeCase(input)
  );

  return handleSupabaseResult<LearningCollection>(
    { data, error },
    "strict",
    "Learning Collection"
  );
}

