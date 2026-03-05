import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  createCollectionReference,
  createCollectionReferences,
} from "@/lib/repositories/collection-references";
import { CollectionReferences } from "@/models";
import { determineReferenceType } from "@/helpers/youtube";

/**
 * Service to create a single collection reference.
 */
export async function createCollectionReferenceService(
  supabase: SupabaseClient,
  collectionId: string,
  referenceUrl: string,
): Promise<CollectionReferences> {
  const referenceData = {
    collection_id: collectionId,
    reference_url: referenceUrl,
    reference_type: determineReferenceType(referenceUrl),
  };

  const { data, error } = await createCollectionReference(
    supabase,
    referenceData,
  );

  return handleSupabaseResult<CollectionReferences>(
    { data, error },
    "strict",
    "Collection Reference",
  );
}

/**
 * Service to create multiple collection references.
 */
export async function createCollectionReferencesService(
  supabase: SupabaseClient,
  collectionId: string,
  referenceUrls: string[],
): Promise<CollectionReferences[]> {
  const referencesToCreate = referenceUrls.map((url) => ({
    collection_id: collectionId,
    reference_url: url,
    reference_type: determineReferenceType(url),
  }));

  const { data, error } = await createCollectionReferences(
    supabase,
    referencesToCreate,
  );

  return handleSupabaseResult<CollectionReferences[]>(
    { data, error },
    "strict",
    "Collection References",
  );
}
