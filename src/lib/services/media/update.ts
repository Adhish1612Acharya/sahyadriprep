import { handleSupabaseResult } from "@/helpers/supabase";
import { fetchMediaById, updateMedia, updateMediaMetadata } from "@/lib/repositories/media";
import { Media } from "@/models";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateInterviewExperienceMediaMetadata(
  supabase: SupabaseClient,
  mediaId: string,
  experienceId: string,
  studentName: string,
  fileKind: "document" | "video"
): Promise<Media | null> {
  const updates = {
    usage_type: "interview_experience",
    metadata: {
      experience_id: experienceId,
      student_name: studentName,
      file_kind: fileKind,
      source: "interview_experience",
    },
  };

  const { data, error } = await updateMediaMetadata(supabase, mediaId, updates);

  const updatedMedia = handleSupabaseResult<Media | null>(
    { data, error },
    "lenient",
    "Interview Experience Media Metadata Update"
  );

  return updatedMedia;
}

/**
 * Service to update the resourceId in a media record's metadata. 
 * Often used after a resource is created to fix 'pending' associations.
 */
export async function updateMediaResourceIdService(
  supabase: SupabaseClient,
  mediaId: string,
  resourceId: string
): Promise<Media> {

  const { data: existing, error: fetchError } = await fetchMediaById(supabase, mediaId);

    const existingMedia = handleSupabaseResult<Media>(
      { data: existing, error: fetchError },
      "strict",
      "Media Fetch"
    );


  const updatedMetadata = {
    ...existingMedia.metadata,
    resource_id: resourceId
  };

  const { data, error } = await updateMedia(supabase, mediaId, { metadata: updatedMetadata });

  return handleSupabaseResult<Media>(
    { data, error },
    "strict",
    "Media Resource ID Update"
  );
}
