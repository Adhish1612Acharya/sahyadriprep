import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/constants";
import { YoutubeLearningResourceDirectMedia } from "@/models";

export async function updateYoutubeLearningResourceDirectMedia(
  supabase: SupabaseClient,
  filters: Partial<YoutubeLearningResourceDirectMedia>,
  input: Partial<
    Pick<YoutubeLearningResourceDirectMedia, "label" | "position">
  >,
): Promise<{
  data: YoutubeLearningResourceDirectMedia | null;
  error: any | null;
}> {
  const { data, error } = await supabase
    .from(TABLES.youtubeLearningResourceDirectMedia)
    .update(input)
    .eq("id", filters.id)
    .select()
    .single();

  return { data, error };
}
