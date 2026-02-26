import { SupabaseClient } from "@supabase/supabase-js";
import { countSegmentMediaAttachments } from "@/lib/repositories/segment-media-attachments";
import { SegmentMediaAttachment } from "@/models";
import { handleSupabaseResult } from "@/helpers/supabase";

export async function countSegmentMediaAttachmentsService(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>
): Promise<number> {
  const { count, error } = await countSegmentMediaAttachments(supabase, filters);

  return handleSupabaseResult<number>(
}