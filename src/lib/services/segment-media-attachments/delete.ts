import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteSegmentMediaAttachment } from "@/lib/repositories/segment-media-attachments";
import { SegmentMediaAttachment } from "@/models";

export async function deleteSegmentMediaAttachmentService(
  supabase: SupabaseClient,
  id: string,
): Promise<SegmentMediaAttachment> {
  const { data, error } = await deleteSegmentMediaAttachment(supabase, { id });

  return handleSupabaseResult<SegmentMediaAttachment>(
    { data, error },
    "strict",
    "Segment Media Attachment",
  );
}
