export type DriveUploadResult = {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
};

export type DriveDeleteResult = {
  success: boolean;
  id: string;
};

export type DriveFetchResult = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
};
