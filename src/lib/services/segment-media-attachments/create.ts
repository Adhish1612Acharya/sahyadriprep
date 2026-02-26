import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { createSegmentMediaAttachment } from "@/lib/repositories/segment-media-attachments";
import { SegmentMediaAttachment } from "@/models";
import { LinkSegmentMediaInput } from "@/lib/repositories/segment-media-attachments/types";

export async function createSegmentMediaAttachmentService(
  supabase: SupabaseClient,
  input: LinkSegmentMediaInput
): Promise<SegmentMediaAttachment> {
  const { data, error } = await createSegmentMediaAttachment(supabase, input);

  return handleSupabaseResult<SegmentMediaAttachment>(
    { data, error },
    "strict",
    "Segment Media Attachment"
  );
}
