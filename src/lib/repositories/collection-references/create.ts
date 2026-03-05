import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { CollectionReferences } from "@/models";

/**
 * Atomic create for a single collection reference.
 */
export async function createCollectionReference(
  supabase: SupabaseClient,
  reference: Pick<
    CollectionReferences,
    "collection_id" | "reference_url" | "reference_type"
  >,
): Promise<{ data: CollectionReferences | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.collectionReferences)
    .insert(reference)
    .select()
    .single();

  return { data, error };
}

/**
 * Atomic create for multiple collection references.
 */
export async function createCollectionReferences(
  supabase: SupabaseClient,
  references: Pick<
    CollectionReferences,
    "collection_id" | "reference_url" | "reference_type"
  >[],
): Promise<{ data: CollectionReferences[] | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.collectionReferences)
    .insert(references)
    .select();

  return { data, error };
}
