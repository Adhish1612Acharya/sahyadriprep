import { uploadInterviewExperiencePDF, uploadInterviewExperienceVideo } from "@/integrations/cloudinary";

export async function uploadInterviewFilesToCloudinary(
  pdfTempPath: string,
  videoTempPath: string | null,
  metadata: { studentName: string; batch: string; companyName: string }
): Promise<{
  success: boolean;
  assets: InterviewUploadCloudinaryAssets;
  error?: string;
}> {
  try {
    // Sequential: PDF first (critical), video optional
    const pdfUpload = await uploadInterviewExperiencePDF(pdfTempPath, metadata);
    if (!pdfUpload.success || pdfUpload.asset == null) {
      return {
        success: false,
        assets: {
          pdf: null,
          video: null,
        },
        error: `PDF upload failed: ${pdfUpload.error}`,
      };
    }

    const assets: InterviewUploadCloudinaryAssets = {
      pdf: pdfUpload.asset,
    };

    // Video optional + parallel only if PDF succeeded
    if (videoTempPath) {
      const videoUpload = await uploadInterviewExperienceVideo(
        videoTempPath,
        metadata
      );
      if (!videoUpload.success || videoUpload.asset == null) {
        console.warn(
          `⚠️ Video upload failed (continuing): ${videoUpload.error}`
        );
      } else {
        assets.video = videoUpload.asset;
      }
    }

    return { success: true, assets };
  } catch (error: any) {
    return {
      success: false,
      assets: {
        pdf: null,
        video: null,
      },
      error: `Upload error: ${error.message}`,
    };
  }
}
