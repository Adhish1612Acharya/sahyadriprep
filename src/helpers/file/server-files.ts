import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Ensure uploads directory exists with optional subdirectory
 * @param subdirectory - Optional subdirectory path (e.g., 'interview_experiences', 'notes/pdfs')
 * @returns Full path to the directory
 */
export async function ensure_uploads_dir_exists(
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

export async function save_uploaded_file(
  file: File,
  options?: {
    customFilename?: string;
    subdirectory?: string;
  }
): Promise<{ path: string | null; error: string | null }> {
  try {
    const { customFilename, subdirectory } = options || {};

    const uploadsDir = await ensure_uploads_dir_exists(subdirectory);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = customFilename || `${timestamp}-${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    console.log(`💾 Saved: ${filePath}`);
    return { path: filePath, error: null };
  } catch (error: any) {
    console.error("Temp save failed:", error);
    return {
      error: error.message || "Failed to save temporary file",
      path: null,
    };
  }
}

/**
 * Delete a file from disk
 */
export async function delete_file(filePath: string): Promise<void> {
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
