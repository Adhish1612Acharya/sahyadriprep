import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { updateSingleYoutubeLearningResource } from "@/lib/repositories/youtube-learning-resources";
import { YoutubeLearningResource } from "@/models";
import { YoutubeLearningResourceFlags } from "./types";
import { syncLearningResourcePublishableStatusService } from "../learning-resources";

export async function updateYoutubeLearningResourceFlagsAndSyncParentResourceService(
  supabase: SupabaseClient,
  id: string,
  flags: YoutubeLearningResourceFlags,
): Promise<YoutubeLearningResource> {
  const { data, error } = await updateSingleYoutubeLearningResource(
    supabase,
    { id },
    flags,
  );

  const youtubeResource = handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource",
  );

  if (flags.is_publishable !== undefined) {
    await syncLearningResourcePublishableStatusService(
      supabase,
      youtubeResource.resource_id,
      flags.is_publishable,
    );
  }

  return youtubeResource;
}
