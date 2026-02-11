import drive from "./config";

/**
 * Makes a Google Drive file public (anyone with the link can view).
 * @param fileId The ID of the file to update permissions for.
 */
export async function makeDriveFilePublic(fileId: string) {
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });
}
