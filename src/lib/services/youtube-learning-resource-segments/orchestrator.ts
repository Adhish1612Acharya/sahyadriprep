import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { HttpError } from "@/lib/api/http";
import { createYoutubeLearningResourceSegment } from "@/lib/repositories/youtube-learning-resource-segments";
import {
  countYoutubeLearningResourceSegmentsService,
  deleteYoutubeLearningResourceSegmentByIdService,
  getSegmentsByYoutubeResourceIdService,
  validateYouTubeSegmentCreation,
} from "@/lib/services/youtube-learning-resource-segments";
import { CreateSegmentSchema } from "@/lib/zod";
import { updateYoutubeLearningResourceFlagsAndSyncParentResourceService, validateCollectionLearningResourceAndYouTubeResourceOwnership } from "../youtube-learning-resources";

export async function createSegmentOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string,
  collectionId: string,
  learningResourceId: string,
  youtubeLearningResourceId: string,
) {
  // 1. Validate

  const { learningResource, youtubeLearningResource } =
    await validateCollectionLearningResourceAndYouTubeResourceOwnership(
      supabase,
      userId,
      collectionId,
      learningResourceId,
      youtubeLearningResourceId,
    );

  const body = await validateRequestBody(request, CreateSegmentSchema);

  await validateYouTubeSegmentCreation(
    supabase,
    learningResource,
    youtubeLearningResource,
    body.startTime,
    body.endTime,
  );

  // 2. Create segment
  const segment = await createYoutubeLearningResourceSegment(supabase, {
    youtube_learning_resource_id: youtubeLearningResourceId,
    title: body.title,
    description: body.description ?? null,
    start_time: body.startTime,
    end_time: body.endTime,
    created_by: userId,
  });

  // 3. Count segments and evaluate publishability
  const count = await countYoutubeLearningResourceSegmentsService(
    supabase,
    youtubeLearningResourceId,
  );

  let updatedYoutubeResource = null;
  if (count >= 2) {
    updatedYoutubeResource =
      await updateYoutubeLearningResourceFlagsAndSyncParentResourceService(
        supabase,
        youtubeLearningResourceId,
        {
          is_publishable: true,
        },
      );
  }

  return { segment, updatedYoutubeResource, segmentCount: count };
}

export async function getSegmentsOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
) {
  const { searchParams } = new URL(request.url);
  const youtubeResourceId = searchParams.get("youtube_resource_id");

  if (!youtubeResourceId) {
    throw new HttpError(
      "youtube_resource_id query param is required",
      400,
      "BAD_REQUEST",
    );
  }

  const segments = await getSegmentsByYoutubeResourceIdService(
    supabase,
    youtubeResourceId,
  );

  return segments;
}

export async function deleteSegmentOrchestrator(
  supabase: SupabaseClient,
  segmentId: string,
  youtubeResourceId: string,
) {
  // 1. Delete segment
  await deleteYoutubeLearningResourceSegmentByIdService(supabase, segmentId);

  // 2. Recount remaining segments
  const count = await countYoutubeLearningResourceSegmentsService(
    supabase,
    youtubeResourceId,
  );

  let updatedYoutubeResource = null;
  if (count < 2) {
    updatedYoutubeResource =
      await updateYoutubeLearningResourceFlagsAndSyncParentResourceService(
        supabase,
        youtubeResourceId,
        {
          is_publishable: false,
        },
      );
  }

  return { deletedSegmentId: segmentId, updatedYoutubeResource };
}
