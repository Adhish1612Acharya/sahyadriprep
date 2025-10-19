import cloudinary from "./config";

/**
 * Get file info from Cloudinary
 */
export async function getCloudinaryFileInfo(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw"
) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("❌ Error fetching Cloudinary file info:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}