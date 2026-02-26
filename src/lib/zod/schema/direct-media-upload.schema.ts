import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/constants";
import z from "zod";

export const DirectMediaUploadSchema = z.object({
  label: z.string().min(1, "Label is required"),
  file: z
    .instanceof(File)
    .refine((f) => ALLOWED_TYPES.includes(f.type), {
      message: "File must be PNG, JPG, WEBP, or PDF",
    })
    .refine((f) => f.size <= MAX_FILE_SIZE, {
      message: "File must be less than 10 MB",
    }),
});

export type DirectMediaUploadInput = z.infer<typeof DirectMediaUploadSchema>;