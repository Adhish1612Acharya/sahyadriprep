import {
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEO_SIZE,
} from "@/constants/file.constants";

/**
 * Validates if a file is a valid video
 */
export function validate_video(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid video type. Allowed: MP4, WebM, MOV. Got: ${file.type}`,
    };
  }

  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video too large. Max: ${MAX_VIDEO_SIZE / 1024 / 1024}MB, Got: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}
