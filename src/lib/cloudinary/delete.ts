import cloudinary from "./config";

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw"
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === "ok") {
      console.log(`✅ Deleted successfully: ${publicId}`);
      return { success: true };
    } else {
      console.warn(`⚠️ Delete failed: ${result.result}`);
      return { success: false, error: result.result };
    }
  } catch (error: any) {
    console.error("❌ Cloudinary delete error:", error);
    return { success: false, error: error.message };
  }
}


