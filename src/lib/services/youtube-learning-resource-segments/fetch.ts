import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchYoutubeLearningResourceSegments,
  fetchSingleYoutubeLearningResourceSegment,
} from "@/lib/repositories/youtube-learning-resource-segments";
import { YoutubeLearningResourceSegment } from "@/models";

export async function getYoutubeLearningResourceSegmentsService(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
  orderBy?: { column: string; ascending?: boolean },
): Promise<YoutubeLearningResourceSegment[]> {
  const { data, error } = await fetchYoutubeLearningResourceSegments(
    supabase,
    filters,
    orderBy,
  );

  return handleSupabaseResult<YoutubeLearningResourceSegment[]>(
    { data, error },
    "lenient",
    "YouTube Learning Resource Segments",
  );
}

export async function getSingleYoutubeLearningResourceSegmentService(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceSegment>,
): Promise<YoutubeLearningResourceSegment> {
  const { data, error } = await fetchSingleYoutubeLearningResourceSegment(
    supabase,
    filters,
  );

  return handleSupabaseResult<YoutubeLearningResourceSegment>(
    { data, error },
    "strict",
    "YouTube Learning Resource Segment",
  );
}
