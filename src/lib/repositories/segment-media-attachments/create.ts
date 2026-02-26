import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { SegmentMediaAttachment } from "@/models";
import { LinkSegmentMediaInput } from "./types";

export async function createSegmentMediaAttachment(
  supabase: SupabaseClient,
  input: LinkSegmentMediaInput
): Promise<{ data: SegmentMediaAttachment | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.segmentMediaAttachments)
    .insert({
      segment_id: input.segment_id,
      media_id: input.media_id,
      label: input.label ?? null,
      position: input.position ?? 0,
      created_by: input.created_by,
    })
    .select()
    .single();

  return { data, error };
}
