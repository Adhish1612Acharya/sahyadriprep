import { deleteFromCloudinary } from "@/integrations/cloudinary";

export async function deleteInterviewExperienceFilesFromCloudinary(assets: {
  pdf: { publicId: string; resourceType: "raw" };
  video?: { publicId: string; resourceType: "video" };
}): Promise<{
  success: boolean;
  results: {
    pdf: { success: boolean; error?: string };
    video?: { success: boolean; error?: string };
  };
  error?: string;
}> {
  const results: {
    pdf: { success: boolean; error?: string };
    video?: { success: boolean; error?: string };
  } = { pdf: { success: false } };

  try {
    if (assets.pdf) {
      try {
        const res = await deleteFromCloudinary(assets.pdf.publicId, "raw");
        results.pdf = res.success
          ? { success: true }
          : { success: false, error: res.error };
      } catch (err: any) {
        results.pdf = {
          success: false,
          error: err?.message || "Unknown error",
        };
      }
    }

    if (assets.video) {
      try {
        const res = await deleteFromCloudinary(assets.video.publicId, "video");
        results.video = res.success
          ? { success: true }
          : { success: false, error: res.error };
      } catch (err: any) {
        results.video = {
          success: false,
          error: err?.message || "Unknown error",
        };
      }
    }

    const success =
      (results.pdf?.success ?? true) && (results.video?.success ?? true);

    return { success, results };
  } catch (error: any) {
    return {
      success: false,
      results,
      error: error?.message || "Cloudinary deletion error",
    };
  }
}
