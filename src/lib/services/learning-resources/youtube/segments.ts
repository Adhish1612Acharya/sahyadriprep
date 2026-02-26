import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  createSegment,
  CreateSegmentInput,
  countSegmentsByYoutubeResourceId,
  deleteSegment,
  linkSegmentMedia,
  LinkSegmentMediaInput,
} from "@/lib/repositories/youtube-learning-resources";
import {
  YoutubeLearningResourceSegment,
  SegmentMediaAttachment,
} from "@/models";

export async function createSegmentService(
  supabase: SupabaseClient,
  input: CreateSegmentInput
): Promise<YoutubeLearningResourceSegment> {
  const { data, error } = await createSegment(supabase, input);

  return handleSupabaseResult<YoutubeLearningResourceSegment>(
    { data, error },
    "strict",
    "Segment"
  );
}

export async function countSegmentsService(
  supabase: SupabaseClient,
  youtubeResourceId: string
): Promise<number> {
  const { count, error } = await countSegmentsByYoutubeResourceId(
    supabase,
    youtubeResourceId
  );

  return handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Segment Count"
  );
}

export async function deleteSegmentService(
  supabase: SupabaseClient,
  segmentId: string
): Promise<{ id: string }> {
  const { data, error } = await deleteSegment(supabase, segmentId);

  return handleSupabaseResult<{ id: string }>(
    { data, error },
    "strict",
    "Segment"
  );
}

export async function linkSegmentMediaService(
  supabase: SupabaseClient,
  input: LinkSegmentMediaInput
): Promise<SegmentMediaAttachment> {
  const { data, error } = await linkSegmentMedia(supabase, input);

  return handleSupabaseResult<SegmentMediaAttachment>(
    { data, error },
    "strict",
    "Segment Media Attachment"
  );
}
