import { HttpError } from "@/lib/api/http";
import { createMediaRecord } from "@/lib/repositories/media";
import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { Media } from "@/models";

export async function createInterviewPdfMediaRecord(
  supabase: SupabaseClient,
  cloudinaryPdf: { secureUrl: string; publicId: string; bytes: number },
  fileName: string,
  userId: string,
  collegeId: string,
): Promise<Media> {
  const { data, error } = await createMediaRecord(supabase, {
    url: cloudinaryPdf.secureUrl,
    public_id: cloudinaryPdf.publicId,
    file_name: fileName,
    file_size: cloudinaryPdf.bytes,
    college_id: collegeId,
    file_type: "application/pdf",
    uploaded_by: userId,
    usage_type: "interview_experience",
    metadata: { file_kind: "document" },
  });

  const uploadedInterviewExperiencePdfMedia = handleSupabaseResult<Media>(
    { data, error },
    "strict",
    "Interview_experience_media",
  );

  return uploadedInterviewExperiencePdfMedia;
}

export async function createInterviewVideoPreviewMediaRecord(
  supabase: SupabaseClient,
  cloudinaryVideo: any,
  fileName: string,
  userId: string,
  collegeId: string,
): Promise<Media | null> {
  if (cloudinaryVideo.format !== "mp4") {
    throw new HttpError(
      "Unsupported video format for interview experience video preview",
      400,
      "UNSUPPORTED_VIDEO_FORMAT",
    );
  }

  const { data, error } = await createMediaRecord(supabase, {
    url: cloudinaryVideo.secureUrl,
    public_id: cloudinaryVideo.publicId,
    file_name: fileName,
    file_size: cloudinaryVideo.bytes,
    college_id: collegeId,
    file_type: `video/${cloudinaryVideo.format || "mp4"}`,
    width: cloudinaryVideo.width || null,
    height: cloudinaryVideo.height || null,
    duration: cloudinaryVideo.duration || null,
    uploaded_by: userId,
    usage_type: "interview_experience",
    metadata: { file_kind: "video_preview" },
  });

  const uploadedInterviewExperienceVideoPreviewMedia =
    handleSupabaseResult<Media | null>(
      { data, error },
      "lenient",
      "Interview_experience_media",
    );

  return uploadedInterviewExperienceVideoPreviewMedia;
}

/**
 * Creates a media record for a learning collection thumbnail uploaded to Drive.
 */
export async function createThumbnailMediaService(
  supabase: SupabaseClient,
  params: {
    fileId: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    collegeId?: string;
    uploadedBy: string;
    resourceType: "learning_collection";
    resourceId: string;
    webViewLink?: string;
  },
): Promise<Media> {
  const { data, error } = await createMediaRecord(supabase, {
    url: params.fileUrl,
    public_id: params.fileId,
    file_name: params.fileName,
    file_size: params.fileSize,
    file_type: params.fileType,
    uploaded_by: params.uploadedBy,
    usage_type: params.resourceType,
    metadata: {
      source: "learning_collection",
      file_kind: "thumbnail",
      uploaded_by: params.uploadedBy,
      resource_id: params.resourceId,
      web_view_link: params.webViewLink,
    },
  });

  return handleSupabaseResult<Media>(
    { data, error },
    "strict",
    "Learning_collection_media",
  );
}

/**
 * Generic media record creation service.
 */
export async function createMediaService(
  supabase: SupabaseClient,
  params: {
    fileUrl: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    usageType: string;
    metadata: Record<string, any>;
    webViewLink?: string;
  },
): Promise<Media> {
  const { data, error } = await createMediaRecord(supabase, {
    url: params.fileUrl,
    public_id: params.fileId,
    file_name: params.fileName,
    file_size: params.fileSize,
    file_type: params.fileType,
    uploaded_by: params.uploadedBy,
    usage_type: params.usageType,
    metadata: {
      ...params.metadata,
      web_view_link: params.webViewLink,
    },
  });

  return handleSupabaseResult<Media>({ data, error }, "strict", "Media");
}
