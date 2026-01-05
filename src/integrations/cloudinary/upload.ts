import cloudinary from "./config";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import type { CloudinaryUploadResult } from "./types";
import { toCloudinaryAsset } from "@/helpers/transformers";

/**
 * Upload a file to Cloudinary from a local file path
 */
export async function uploadToCloudinary(
  filePath: string,
  options: {
    folder: string;
    resourceType: "auto" | "image" | "video" | "raw";
    tags: string[];
    overwrite?: boolean;
    publicId?: string;
  }
): Promise<CloudinaryUploadResult> {
  try {
    const {
      folder,
      resourceType = "auto",
      publicId,
      overwrite = false,
      tags = [],
    } = options;

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

    return {
      success: true,
      asset: toCloudinaryAsset(result),
    };
  } catch (error: unknown) {
    console.error("❌ Cloudinary upload error:", error);

    const isUploadApiError = (e: unknown): e is UploadApiErrorResponse =>
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as Record<string, unknown>).message === "string";

    let message: string;

    if (isUploadApiError(error)) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      try {
        message = String(error);
      } catch {
        message = "Upload failed";
      }
    }

    return {
      success: false,
      error: message,
      asset: null,
    };
  }
}

/**
 * Upload interview experience PDF to Cloudinary
 */
export async function uploadInterviewExperiencePDF(
  filePath: string,
  metadata: {
    studentName: string;
    companyName: string;
    batch: string;
  }
): Promise<CloudinaryUploadResult> {
  const { studentName, companyName, batch } = metadata;

  const tags = ["interview-experience"];
  if (companyName)
    tags.push(`company-${companyName.toLowerCase().replace(/\s/g, "-")}`);
  if (batch) tags.push(`batch-${batch}`);
  if (studentName)
    tags.push(`student-${studentName.toLowerCase().replace(/\s/g, "-")}`);

  return uploadToCloudinary(filePath, {
    folder: "sahyadriprep/interview_experiences/documents",
    resourceType: "raw",
    tags,
  });
}

export async function uploadInterviewExperienceVideo(
  filePath: string,
  metadata: {
    studentName: string;
    companyName: string;
    batch: string;
  }
): Promise<CloudinaryUploadResult> {
  const { studentName, companyName, batch } = metadata;
  const tags = ["interview-experience-video"];
  if (companyName)
    tags.push(`company-${companyName.toLowerCase().replace(/\s/g, "-")}`);
  if (batch) tags.push(`batch-${batch}`);
  if (studentName)
    tags.push(`student-${studentName.toLowerCase().replace(/\s/g, "-")}`);

  return uploadToCloudinary(filePath, {
    folder: "sahyadriprep/interview_experiences/videos",
    resourceType: "video",
    tags,
  });
}
