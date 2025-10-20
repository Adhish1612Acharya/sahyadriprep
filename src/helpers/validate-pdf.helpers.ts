/**
 * Validate file is PDF
 */
export function validate_pdf(file: File): { valid: boolean; error?: string } {
  if (file.type !== "application/pdf") {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Only PDF files are allowed.`,
    };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return {
      valid: false,
      error: "File must have .pdf extension",
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB) exceeds maximum (10MB)`,
    };
  }

  return { valid: true };
}
