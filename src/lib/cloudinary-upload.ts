import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type UploadOptions = {
  fileFieldNames: string[]; // Allowed field names (e.g. ['file', 'image', 'media'])
  folder?: string; // Cloudinary folder path (optional)
  multiple?: boolean; // Accept multiple files per field
};

type UploadResult = {
  url: string;
  public_id: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export async function handleCloudinaryUpload(
  formData: FormData,
  options: UploadOptions
): Promise<UploadResult[]> {
  const uploads: UploadResult[] = [];

  for (const field of options.fileFieldNames) {
    const entries = formData.getAll(field);

    for (const entry of entries) {
      if (!entry || typeof entry === "string") continue;

      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: UploadResult = await new Promise(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: options.folder,
              resource_type: "auto",
            },
            (error, result) =>
              error ? reject(error) : resolve(result as UploadResult)
          );
          uploadStream.end(buffer);
        }
      );

      uploads.push(uploadResult);

      // If not multiple, break after first
      if (!options.multiple) break;
    }
  }

  return uploads;
}
