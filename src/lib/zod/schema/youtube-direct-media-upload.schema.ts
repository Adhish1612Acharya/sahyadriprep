import { ALLOWED_TYPES } from "@/constants";
import z from "zod";

export const ytDirectMediaUploadSchema = z.object({
  label: z.string().min(1, "Label is required"),
  file: z
    .instanceof(File)
    .refine((f) => ALLOWED_TYPES.includes(f.type), {
      message: "File must be PNG, JPG, WEBP, or PDF",
    })
    .refine((f) => f.size <= 10 * 1024 * 1024, {
      message: "File must be less than 10 MB",
    }),
});

export type YtDirectMediaUploadInput = z.infer<
  typeof ytDirectMediaUploadSchema
>;
