import { SupabaseClient } from "@supabase/supabase-js";

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
  resourceType: "image" | "video" | "raw";
  createdAt: string;
  bytes: number;
  fileName: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface CloudinaryUploadResult {
  success: boolean;
  error?: string;
  asset: CloudinaryAsset | null;
}

export interface RollbackContext {
  tempFiles: string[];
  cloudinaryAssets: CloudinaryAsset[];
  mediaIds: string[];
  experienceId?: string | null;
  supabase: SupabaseClient;
}
