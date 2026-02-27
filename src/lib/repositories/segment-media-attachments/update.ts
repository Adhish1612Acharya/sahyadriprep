import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { SegmentMediaAttachment } from "@/models";

export async function updateSegmentMediaAttachment(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>,
  input: Partial<Pick<SegmentMediaAttachment, "label" | "position">>
): Promise<{ data: SegmentMediaAttachment | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.segmentMediaAttachments)
    .update(input)
    .match(filters)
    .select()
    .single();

  return { data, error };
}
