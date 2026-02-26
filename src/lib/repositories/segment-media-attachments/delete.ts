import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { SegmentMediaAttachment } from "@/models";

export async function deleteSegmentMediaAttachment(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>
): Promise<{ data:SegmentMediaAttachment | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.segmentMediaAttachments)
    .delete()
    .match(filters)
    .select("*")
    .single();

  return { data, error };
}