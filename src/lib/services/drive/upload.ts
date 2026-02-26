import { uploadToDrivePath } from "@/integrations/drive";
import { DriveUploadResult } from "@/integrations/drive/types";
import { UploadFileToDriveOptions, UploadFileToDriveResult } from "./types";



export async function uploadLearningResourceMediaToDrive(
  file: File,
  options: UploadFileToDriveOptions,
): Promise<UploadFileToDriveResult> {
  try {
    const { folder, resourceId, makePublic = true } = options;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = resourceId ? `${resourceId}_${file.name}` : file.name;
    const folderPath = folder ? folder : undefined;

    const result: DriveUploadResult = await uploadToDrivePath(
      buffer,
      fileName,
      file.type,
      folderPath,
      makePublic,
    );

    console.log("Drive upload result", result); 

    return {
      success: true,
      fileId: result.id,
      fileUrl: {
        webViewLink: result.webViewLink || "",
        webContentLink:result.webContentLink || ""
      },
      fileName: result.name,
    };
  } catch (error: any) {
    console.log("Drive upload error", error);
    return {
      success: false,
      error: error?.message || "Unknown error during Drive upload",
    };
  }
}
