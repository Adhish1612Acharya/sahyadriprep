import { HttpError } from "@/lib/api/http";
import { createMediaRecord } from "@/lib/repositories/media";
import { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseResult } from "@/helpers/supabase";
import { Media } from "@/models";
import { updateMediaMetadata } from "@/lib/repositories/media/update";
import { InterviewUploadCloudinaryAssets } from "../cloudinary/types";
import { CloudinaryAsset } from "@/integrations/cloudinary";

export async function createInterviewPdfMediaRecord(
  supabase: SupabaseClient,
  cloudinaryPdf: { secureUrl: string; publicId: string; bytes: number },
  fileName: string,
  userId: string,
  collegeId: string
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
    "Interview_experience_media"
  );

  return uploadedInterviewExperiencePdfMedia;
}

export async function createInterviewVideoPreviewMediaRecord(
  supabase: SupabaseClient,
  cloudinaryVideo: CloudinaryAsset,
  fileName: string,
  userId: string,
  collegeId: string
): Promise<Media | null> {
  if (cloudinaryVideo.format !== "mp4") {
    throw new HttpError(
      "Unsupported video format for interview experience video preview",
      400,
      "UNSUPPORTED_VIDEO_FORMAT"
    );
  }

  const { data, error } = await createMediaRecord(supabase, {
    url: cloudinaryVideo.secureUrl,
    public_id: cloudinaryVideo.publicId,
    file_name: fileName, // videoFile.name (fix your code)
    file_size: cloudinaryVideo.bytes,
    college_id: collegeId,
    file_type: `video/${cloudinaryVideo.format || "mp4"}`, // video/mp4
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
      "Interview_experience_media"
    );

  return uploadedInterviewExperienceVideoPreviewMedia;
}

export async function createInterviewExperienceMediaRecords(
  supabase: SupabaseClient,
  cloudinaryAssets: InterviewUploadCloudinaryAssets,
  userId: string,
  collegeId: string
): Promise<{ pdfMediaId: string; videoMediaId: string | null }> {
  if (!cloudinaryAssets.pdf?.secureUrl) {
    throw new HttpError(
      "PDF Cloudinary URL missing",
      500,
      "CLOUDINARY_PDF_FAILED"
    );
  }

  if (!cloudinaryAssets.pdf?.format || cloudinaryAssets.pdf.format !== "pdf") {
    throw new HttpError(
      "Unsupported PDF format for interview experience",
      400,
      "UNSUPPORTED_PDF_FORMAT"
    );
  }

  const [pdfMediaResult, videoMediaResult] = await Promise.all([
    createInterviewPdfMediaRecord(
      supabase,
      cloudinaryAssets.pdf,
      cloudinaryAssets.pdf.fileName,
      userId,
      collegeId
    ),
    cloudinaryAssets.video
      ? createInterviewVideoPreviewMediaRecord(
          supabase,
          cloudinaryAssets.video,
          cloudinaryAssets.video.fileName,
          userId,
          collegeId
        )
      : null,
  ]);

  return {
    pdfMediaId: pdfMediaResult.id,
    videoMediaId: videoMediaResult?.id || null,
  };
}


