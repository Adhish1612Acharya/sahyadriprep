import drive from "./config";
import { DriveFetchResult } from "./types";

export async function fetchDriveFile(
  fileId: string,
): Promise<DriveFetchResult> {
  const res = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, webViewLink, webContentLink",
  });
  return res.data as DriveFetchResult;
}
