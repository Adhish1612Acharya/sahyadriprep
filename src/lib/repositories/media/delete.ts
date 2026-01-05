import type { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { Media } from "@/models";

export async function deleteMediaByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<{ data: Media[] | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.media)
    .delete()
    .in("id", ids)
    .select();

  return { data, error };
}

export async function deleteOwnMediaForCollegeById(
  supabase: SupabaseClient,
  mediaId: string,
  collegeId: string,
  userId: string
): Promise<{ data: Media | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.media)
    .delete()
    .eq("id", mediaId)
    .eq("college_id", collegeId)
    .eq("uploaded_by", userId)
    .select()
    .single();

  return { data, error };
}
