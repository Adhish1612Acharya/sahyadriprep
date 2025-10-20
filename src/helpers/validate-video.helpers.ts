const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
];

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

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
