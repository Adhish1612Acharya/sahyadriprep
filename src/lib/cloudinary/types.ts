export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  format?: string;
  resourceType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  error?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: "auto" | "image" | "video" | "raw";
  overwrite?: boolean;
  tags?: string[];
}

export interface CloudinaryAsset {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
}
