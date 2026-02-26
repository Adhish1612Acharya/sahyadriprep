import { CloudinaryAsset } from "@/integrations/cloudinary";
import { UploadApiResponse } from "cloudinary";
import camel from "to-camel-case";
import snake from "to-snake-case";

export function toCamelCase<T>(data: T): any {
  if (Array.isArray(data)) {
    return data.map(toCamelCase);
  }
  if (data && typeof data === "object" && data !== null) {
    const camelCased: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      camelCased[camel(key)] = toCamelCase(value);
    }
    return camelCased;
  }
  return data;
}

export function toSnakeCase<T>(data: T): any {
  if (Array.isArray(data)) {
    return data.map(toSnakeCase);
  }
  if (data && typeof data === "object" && data !== null) {
    const snakeCased: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      snakeCased[snake(key)] = toSnakeCase(value);
    }
    return snakeCased;
  }
  return data;
}

export function toCloudinaryAsset(
  result: UploadApiResponse,
  createdAt?: string, // Optional, if you want to pass a custom createdAt
): CloudinaryAsset | null {
  if (!result.success) return null;
  return {
    publicId: result.asset.publicId,
    url: result.url,
    secureUrl: result.secureUrl,
    format: result.format,
    resourceType: result.resourceType as "image" | "video" | "raw",
    fileName: result.originalFilename,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    duration: result.duration,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}
