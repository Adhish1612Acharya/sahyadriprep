export const ERROR_MAP: Record<string, { status: number; message: string }> = {
  // Company-specific
  DUPLICATE_NAME: {
    status: 409,
    message: "A company with this name already exists",
  },
  NO_FIELDS: {
    status: 400,
    message: "No valid fields to update",
  },

  // Auth / access
  UNAUTHENTICATED: {
    status: 401,
    message: "Authentication required",
  },
  UNAUTHORIZED: {
    status: 403,
    message: "You are not allowed to perform this action",
  },

  // Not found
  NOT_FOUND: {
    status: 404,
    message: "Resource not found",
  },
  COMPANY_NOT_FOUND: {
    status: 404,
    message: "Company not found",
  },
  PROFILE_NOT_FOUND: {
    status: 404,
    message: "User profile not found",
  },

  // Validation
  VALIDATION_ERROR: {
    status: 400,
    message: "Invalid request data",
  },

  // Dependencies
  COMPANY_HAS_INTERVIEW_EXPERIENCES: {
    status: 409,
    message:
      "This company has associated interview experiences. Please delete them first.",
  },
  COMPANY_HAS_YOUTUBE_VIDEOS: {
    status: 409,
    message:
      "This company has associated YouTube videos. Please delete them first.",
  },

  // Generic DB / server
  DB_ERROR: {
    status: 500,
    message: "Database error occurred",
  },
  UNKNOWN_ERROR: {
    status: 500,
    message: "Internal server error",
  },
};
