import drive from "./config";
import { DriveDeleteResult } from "./types";

export async function deleteFromDrive(
  fileId: string,
): Promise<DriveDeleteResult> {
  await drive.files.delete({ fileId });
  return { success: true, id: fileId };
}
