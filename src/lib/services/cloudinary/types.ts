import { CloudinaryAsset } from "@/integrations/cloudinary";

export interface InterviewUploadCloudinaryAssets {
  pdf: CloudinaryAsset | null;
  video?: CloudinaryAsset | null;
}
