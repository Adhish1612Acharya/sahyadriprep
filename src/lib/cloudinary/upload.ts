import cloudinary from "./config";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import type { CloudinaryUploadResult } from "./types";

/**
 * Upload a file to Cloudinary from a local file path
 */
export async function uploadToCloudinary(
  filePath: string,
  options: {
    folder?: string;
    resourceType?: "auto" | "image" | "video" | "raw";
    publicId?: string;
    overwrite?: boolean;
    tags?: string[];
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    const {
      folder = "uploads",
      resourceType = "auto",
      publicId,
      overwrite = false,
      tags = [],
    } = options;

    console.log(`☁️ Uploading to Cloudinary: ${filePath}`);

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        overwrite,
        tags,
        use_filename: true,
        unique_filename: !publicId,
      }
    );

    console.log(`✅ Upload successful: ${result.secure_url}`);

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
    };
  } catch (error: unknown) {
    console.error("❌ Cloudinary upload error:", error);

    const isUploadApiError = (e: unknown): e is UploadApiErrorResponse =>
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as Record<string, unknown>).message === "string";

    let message = "Upload failed";

    if (isUploadApiError(error)) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      try {
        message = String(error);
      } catch {
        // keep default
      }
    }

    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Upload interview experience PDF to Cloudinary
 */
export async function uploadInterviewExperiencePDF(
  filePath: string,
  metadata: {
    student_name?: string;
    company_name?: string;
    batch?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  const { student_name, company_name, batch } = metadata;

  const tags = ["interview-experience"];
  if (company_name)
    tags.push(`company-${company_name.toLowerCase().replace(/\s/g, "-")}`);
  if (batch) tags.push(`batch-${batch}`);
  if (student_name)
    tags.push(`student-${student_name.toLowerCase().replace(/\s/g, "-")}`);

  return uploadToCloudinary(filePath, {
    folder: "sahyadriprep/interview_experiences/documents",
    resourceType: "raw",
    tags,
  });
}

export async function uploadInterviewExperienceVideo(
  filePath: string,
  metadata: {
    student_name?: string;
    company_name?: string;
    batch?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  const { student_name, company_name, batch } = metadata;

  const tags = ["interview-experience-video"];
  if (company_name)
    tags.push(`company-${company_name.toLowerCase().replace(/\s/g, "-")}`);
  if (batch) tags.push(`batch-${batch}`);
  if (student_name)
    tags.push(`student-${student_name.toLowerCase().replace(/\s/g, "-")}`);

  return uploadToCloudinary(filePath, {
    folder: "sahyadriprep/interview_experiences/videos",
    resourceType: "video",
    tags,
    // Video-specific options can be passed to uploadToCloudinary if needed
  });
}
