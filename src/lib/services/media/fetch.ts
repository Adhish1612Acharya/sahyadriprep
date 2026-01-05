import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchMediaById } from "@/lib/repositories/media/fetch";
import { handleSupabaseResult } from "@/helpers/supabase";
import type { Media } from "@/models";

export async function getMediaByIdService(
  supabase: SupabaseClient,
  id: string
): Promise<Media> {
  const { data, error } = await fetchMediaById(supabase, id);

  return handleSupabaseResult<Media>({ data, error }, "strict", "Media", {
    id,
  });
}
