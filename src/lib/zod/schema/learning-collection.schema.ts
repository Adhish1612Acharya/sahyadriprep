import { z } from "zod";

export const LearningCollectionCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  thumbnail: z
    .instanceof(File)
    .refine(
      (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
      { message: "Thumbnail must be PNG, JPG, or JPEG" },
    )
    .refine(
      (file) => file.size <= 2 * 1024 * 1024, // 2MB limit
      { message: "Thumbnail must be less than 2MB" },
    ),
  references: z
    .array(z.string().url("Each reference must be a valid URL"))
    .min(1, "At least one reference URL is required"),
});

export type LearningCollectionCreateInput = z.infer<
  typeof LearningCollectionCreateSchema
>;
