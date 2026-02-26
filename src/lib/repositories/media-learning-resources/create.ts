import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { MediaLearningResource } from "@/models";


export async function createMediaLearningResource(
  supabase: SupabaseClient,
  input:Partial<MediaLearningResource>
): Promise<{ data: MediaLearningResource | null; error: any | null }> {
  const { data, error } = await supabase
    .from(TABLES.mediaLearningResources)
    .insert(input)
    .select()
    .single();

  return { data, error };
}
