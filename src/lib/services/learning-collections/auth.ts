import { SupabaseClient } from "@supabase/supabase-js";
import { getLearningCollectionByIdService } from "./fetch";
import { HttpError } from "@/lib/api/http";

/**
 * Ensures a user owns the given learning collection.
 * 
 * @param supabase 
 * @param collectionId 
 * @param userId 
 * @throws HttpError if unauthorized or not the owner
 */
export async function requireCollectionOwnershipService(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string
) {
  const collection = await getLearningCollectionByIdService(supabase, collectionId);

  if (collection.created_by !== userId) {
    throw new HttpError(
      "You do not have permission to modify this collection",
      403,
      "FORBIDDEN"
    );
  }

  return collection;
}
