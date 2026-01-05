import { handleSupabaseResult } from "@/helpers/supabase";
import { deleteOwnMediaForCollegeById } from "@/lib/repositories/media";
import { Media } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteOwnMediaForCollegeByIdService(
  supabase: SupabaseClient,
  mediaId: string,
  collegeId: string,
  userId: string
): Promise<Media> {
  const { data, error } = await deleteOwnMediaForCollegeById(
    supabase,
    mediaId,
    collegeId,
    userId
  );

  return handleSupabaseResult<Media>({ data, error }, "strict", "Media", {
    mediaId,
    collegeId,
    userId,
  });
}
