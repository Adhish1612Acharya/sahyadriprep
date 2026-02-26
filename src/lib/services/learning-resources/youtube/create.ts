import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import {
  createYoutubeLearningResource,
  YoutubeLearningResourceCreateInput,
} from "@/lib/repositories/youtube-learning-resources";
import { YoutubeLearningResource } from "@/models";

export async function createYoutubeLearningResourceService(
  supabase: SupabaseClient,
  input: YoutubeLearningResourceCreateInput
): Promise<YoutubeLearningResource> {
  const { data, error } = await createYoutubeLearningResource(supabase, input);

  return handleSupabaseResult<YoutubeLearningResource>(
    { data, error },
    "strict",
    "YouTube Learning Resource"
  );
}
