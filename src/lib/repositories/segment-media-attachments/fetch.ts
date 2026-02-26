import { TABLES } from "@/constants";
import { SegmentMediaAttachment } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSegmentMediaAttachments(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>,
  orderBy?: { column: string; ascending?: boolean },
): Promise<{ data: SegmentMediaAttachment[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.segmentMediaAttachments)
    .select("*")
    .match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, {
      ascending: orderBy.ascending ?? true,
    });
  }

  const { data, error } = await query;
  return { data, error };
}

export async function fetchSegmentMediaAttachmentsWithMedia(
  supabase: SupabaseClient,
  filters: Partial<SegmentMediaAttachment>,
  orderBy?: { column: string; ascending?: boolean },
): Promise<{ data: any[] | null; error: any | null }> {
  let query = supabase
    .from(TABLES.segmentMediaAttachments)
    .select(
      `
      *,
      media:media_id(*)
    `,
    )
    .match(filters);

  if (orderBy) {
    query = query.order(orderBy.column, {
      ascending: orderBy.ascending ?? true,
    });
  }

  const { data, error } = await query;
  return { data, error };
}
