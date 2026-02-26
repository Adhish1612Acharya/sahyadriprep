import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchSegmentMediaAttachments,
  fetchSegmentMediaAttachmentsWithMedia,
} from "@/lib/repositories/segment-media-attachments";
import { SegmentMediaAttachment } from "@/models";

export async function getSegmentMediaAttachmentsService(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<SegmentMediaAttachment[]> {
  const { data, error } = await fetchSegmentMediaAttachments(
    supabase,
    filters,
    orderBy
  );

  return handleSupabaseResult<SegmentMediaAttachment[]>(
    { data, error },
    "lenient",
    "Segment Media Attachments"
  );
}

export async function getSegmentMediaAttachmentsWithMediaService(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<any[]> {
  const { data, error } = await fetchSegmentMediaAttachmentsWithMedia(
    supabase,
    filters,
    orderBy
  );

  return handleSupabaseResult<any[]>(
    { data, error },
    "lenient",
    "Segment Media Attachments with Media"
  );
}
