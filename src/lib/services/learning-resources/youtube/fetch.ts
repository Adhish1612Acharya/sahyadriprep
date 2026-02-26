import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  fetchYoutubeLearningResourceById,
  fetchYoutubeLearningResourceByResourceId,
  fetchSegmentsByYoutubeResourceId,
  fetchDirectMediaByYoutubeResourceId,
} from "@/lib/repositories/youtube-learning-resources";
import {
  YoutubeLearningResource,
  YoutubeLearningResourceSegment,
} from "@/models";

export async function getYoutubeLearningResourceByIdService(
  supabase: SupabaseClient,
  id: string
): Promise<YoutubeLearningResource> {
  const { data, error } = await fetchYoutubeLearningResourceById(supabase, id);

  return handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource"
  );
}

export async function getYoutubeLearningResourceByResourceIdService(
  supabase: SupabaseClient,
  resourceId: string
): Promise<YoutubeLearningResource> {
  const { data, error } = await fetchYoutubeLearningResourceByResourceId(
    supabase,
    resourceId
  );

  return handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource"
  );
}

export async function getSegmentsByYoutubeResourceIdService(
  supabase: SupabaseClient,
  youtubeResourceId: string
): Promise<YoutubeLearningResourceSegment[]> {
  const { data, error } = await fetchSegmentsByYoutubeResourceId(
    supabase,
    youtubeResourceId
  );

  return handleSupabaseResult<YoutubeLearningResourceSegment[]>(
    { data, error },
    "lenient",
    "Segments"
  );
}

export async function getYouTubeDirectMediaService(
  supabase: SupabaseClient,
  youtubeResourceId: string
): Promise<any[]> {
  const { data, error } = await fetchDirectMediaByYoutubeResourceId(
    supabase,
    youtubeResourceId
  );

  return handleSupabaseResult<any[]>(
    { data, error },
    "lenient",
    "YouTube Direct Media"
  );
}

export async function countYoutubeDirectMediaByResourceIdService(
  supabase: SupabaseClient,
  youtubeResourceId: string
): Promise<number> {
  const { countYoutubeDirectMedia } = await import("@/lib/repositories/youtube-learning-resources/direct-media");
  const { count, error } = await countYoutubeDirectMedia(supabase, youtubeResourceId);

  return handleSupabaseResult<number>(
    { data: count, error },
    "strict",
    "Direct Media Count"
  );
}
