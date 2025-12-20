import { delete_file } from "./server-files";

/**
 * Cleanup multiple temp files
 */
export async function cleanup_temp_files(filePaths: string[]): Promise<void> {
  const deletePromises = filePaths.map(async (filePath) => {
    try {
      await delete_file(filePath);
    } catch (error) {
      console.warn(`⚠️ Could not delete ${filePath}:`, error);
    }
  });

  await Promise.allSettled(deletePromises);
}

export async function generateFileBuffer(
  file_argument: string | File | Uint8Array<ArrayBufferLike>
): Promise<Buffer> {
  if (typeof file_argument === "string") {
    // Read file from disk
    const data = await import("fs/promises").then((fs) =>
      fs.readFile(file_argument)
    );
    return data;
  } else if (file_argument instanceof Uint8Array) {
    // Convert Uint8Array to Buffer
    return Buffer.from(file_argument);
  } else {
    // Convert File to Buffer
    const arrayBuffer = await file_argument.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

/**
 * Generates a file name with timestamp
 * Useful for creating unique file names for downloads
 *
 * @param baseName - Base name for the file
 * @param extension - File extension (e.g., 'pdf', 'docx')
 * @returns Formatted file name with timestamp
 */
export function generateFileName(baseName: string, extension: string): string {
  const sanitizedName = baseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${sanitizedName}_${timestamp}.${extension}`;
}

/**
 * Creates a file download response for API routes
 * Handles proper headers and blob creation
 *
 * @param fileBuffer - Buffer containing the file data
 * @param fileName - Name of the file to download
 * @param mimeType - MIME type of the file
 * @returns Response object for API routes
 */
export function createDownloadResponse(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Response {
  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}

/**
 * Creates a Blob from a file buffer for client-side downloads
 * Useful for browser-based file downloads
 *
 * @param fileBuffer - Buffer containing the file data
 * @param mimeType - MIME type of the file
 * @returns Blob object
 */
export function createFileBlob(fileBuffer: Buffer, mimeType: string): Blob {
  return new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
}

/**
 * Triggers a download in the browser
 * Creates a temporary link and clicks it to download
 *
 * @param blob - Blob object to download
 * @param fileName - Name of the file
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
