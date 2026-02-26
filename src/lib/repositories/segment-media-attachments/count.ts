import { TABLES } from "@/constants";
import { SegmentMediaAttachment } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function countSegmentMediaAttachments(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>,
): Promise<{ count: number; error: any | null }> {
  const { count, error } = await supabase
    .from(TABLES.segmentMediaAttachments)
    .select("id", { count: "exact", head: true })
    .match(filters);

  return { count: count ?? 0, error };
}

