export interface UploadFileToDriveOptions {
  folder: string;
  resourceId: string;
  makePublic: boolean;
}

export interface UploadFileToDriveResult {
  success: boolean;
  fileId?: string;
  fileUrl?: {
    webViewLink: string;
    webContentLink: string;
  };
  fileName?: string;
  error?: string;
}
