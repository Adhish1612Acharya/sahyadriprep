import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchYoutubeLearningResourceSegments,
  fetchSingleYoutubeLearningResourceSegment,
} from "@/lib/repositories/youtube-learning-resource-segments";
import { YoutubeLearningResourceSegment } from "@/models";

export async function getYoutubeLearningResourceSegmentByIdService(
  supabase: SupabaseClient,
  id: string,
): Promise<YoutubeLearningResourceSegment> {
  const { data, error } = await fetchSingleYoutubeLearningResourceSegment(
    supabase,
    {
      id,
    },
  );

  return handleSupabaseResult<YoutubeLearningResourceSegment>(
    { data, error },
    "strict",
    "YouTube Learning Resource Segment",
  );
}

export async function getSegmentsByYoutubeResourceIdService(
  supabase: SupabaseClient,
  youtubeResourceId: string,
): Promise<YoutubeLearningResourceSegment[]> {
  const { data, error } = await fetchYoutubeLearningResourceSegments(supabase, {
    youtube_learning_resource_id: youtubeResourceId,
  });

  return handleSupabaseResult<YoutubeLearningResourceSegment[]>(
    { data, error },
    "lenient",
    "Segments",
  );
}
