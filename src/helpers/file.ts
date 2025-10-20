import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Ensure uploads directory exists with optional subdirectory
 * @param subdirectory - Optional subdirectory path (e.g., 'interview_experiences', 'notes/pdfs')
 * @returns Full path to the directory
 */
export async function ensureUploadsDirExists(
  subdirectory?: string
): Promise<string> {
  const baseUploadsDir = path.join(process.cwd(), "public", "uploads");

  // ✅ If subdirectory provided, append it to the path
  const uploadsDir = subdirectory
    ? path.join(baseUploadsDir, subdirectory)
    : baseUploadsDir;

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
  }

  return uploadsDir;
}

/**
 * Save uploaded file temporarily
 * @param file - File from FormData
 * @param options - Save options
 * @returns Path to saved file
 */
export async function saveUploadedFile(
  file: File,
  options?: {
    customFilename?: string;
    subdirectory?: string; // ✅ NEW: Support subdirectories
  }
): Promise<string> {
  const { customFilename, subdirectory } = options || {};

  // ✅ Create directory with optional subdirectory
  const uploadsDir = await ensureUploadsDirExists(subdirectory);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = customFilename || `${timestamp}-${safeName}`;
  const filePath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);
  console.log(`💾 Saved file to: ${filePath}`);

  return filePath;
}

/**
 * Delete a file from disk
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Cleanup multiple temp files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  const deletePromises = filePaths.map(async (filePath) => {
    try {
      await deleteFile(filePath);
    } catch (error) {
      console.warn(`⚠️ Could not delete ${filePath}:`, error);
    }
  });

  await Promise.allSettled(deletePromises);
}
