import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateSegmentMediaAttachment } from "@/lib/repositories/segment-media-attachments";
import { SegmentMediaAttachment } from "@/models";

export async function updateSegmentMediaAttachmentService(
  supabase: SupabaseClient,
  id: string,
  input: Partial<Pick<SegmentMediaAttachment, "label" | "position">>,
): Promise<SegmentMediaAttachment> {
  const { data, error } = await updateSegmentMediaAttachment(
    supabase,
    { id },
    input
  );

  return handleSupabaseResult<SegmentMediaAttachment>(
    { data, error },
    "strict",
    "Segment Media Attachment",
  );
}
