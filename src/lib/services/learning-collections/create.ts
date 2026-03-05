import { createLearningCollection } from "@/lib/repositories/learning-collections";
import { handleSupabaseResult } from "@/helpers/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { LearningCollectionCreateInput } from "@/lib/zod";
import { toSnakeCase } from "@/helpers/transformers";

export async function createLearningCollectionService(
  supabase: SupabaseClient,
  input: Omit<LearningCollectionCreateInput, "thumbnail" | "references"> & {
    thumbnailMediaId?: string;
    createdBy?: string;
  },
) {
  const { data, error } = await createLearningCollection(
    supabase,
    toSnakeCase(input),
  );

  return handleSupabaseResult({ data, error }, "strict", "Learning Collection");
}
