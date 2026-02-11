import { ENV } from "@/config";
import drive from "./config";
import { DriveUploadResult } from "./types";
import { Readable } from "stream";
import { makeDriveFilePublic } from "./permissions";

/**
 * Finds or creates a folder by name under the given parent folder.
 */
async function getOrCreateDriveFolder(
  name: string,
  parentId: string,
): Promise<string> {
  // Search for the folder
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }
  // Create the folder if not found
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  return folder.data.id!;
}

/**
 * Resolves a folder path (e.g. "users/123/resource-collection") to a folder ID,
 * creating folders as needed under the root folder.
 */
async function resolveDriveFolderPath(
  path: string,
  rootFolderId: string,
): Promise<string> {
  const segments = path.split("/").filter(Boolean);
  let parentId = rootFolderId;
  for (const segment of segments) {
    parentId = await getOrCreateDriveFolder(segment, parentId);
  }
  return parentId;
}

/**
 * Uploads a file to Google Drive at the specified folder path.
 * Optionally makes the file public (anyone with the link can view).
 * @param file Buffer or Readable stream of the file
 * @param name Name of the file
 * @param mimeType MIME type of the file
 * @param folderPath Path like "users/123/resource-collection"
 * @param makePublic Whether to make the file public (default: true)
 */
export async function uploadToDrivePath(
  file: Buffer | Readable,
  name: string,
  mimeType: string,
  folderPath?: string,
  makePublic: boolean = true,
): Promise<DriveUploadResult> {
  const rootFolderId = ENV.GOOGLE_DRIVE_FOLDER_ID;
  let parentId = rootFolderId;
  if (folderPath) {
    parentId = await resolveDriveFolderPath(folderPath, rootFolderId);
  }
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType,
      parents: [parentId],
    },
    media: {
      mimeType,
      body: file instanceof Buffer ? Readable.from(file) : file,
    },
    fields: "id, name, webViewLink, webContentLink",
  });

  if (makePublic && res.data.id) {
    await makeDriveFilePublic(res.data.id);
  }

  return res.data as DriveUploadResult;
}
