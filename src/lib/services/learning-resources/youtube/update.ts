import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  updateYoutubeLearningResourceFlags,
  YoutubeLearningResourceFlags,
} from "@/lib/repositories/youtube-learning-resources";
import { YoutubeLearningResource } from "@/models";

import { updateLearningResource } from "@/lib/repositories/learning-resources";

/**
 * Updates one or more publishability/availability flags.
 * Enforces the business rule check:
 *   is_publishable = true  iff  direct_media_resources_available OR segments_available
 * 
 * Synchronizes is_publishable with the parent learning_resources table.
 */
export async function updateYoutubeFlagsService(
  supabase: SupabaseClient,
  id: string,
  flags: YoutubeLearningResourceFlags
): Promise<YoutubeLearningResource> {
  const { data, error } = await updateYoutubeLearningResourceFlags(
    supabase,
    id,
    flags
  );

  const youtubeResource = handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource"
  );

  // Synchronize publishable status to parent if it changed
  if (flags.is_publishable !== undefined) {
    await updateLearningResource(
      supabase,
      { id: youtubeResource.resource_id },
      { is_publishable: flags.is_publishable }
    );
  }

  return youtubeResource;
}
