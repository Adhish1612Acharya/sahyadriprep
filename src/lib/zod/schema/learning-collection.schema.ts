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
  isPremium: z.boolean().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type LearningCollectionCreateInput = z.infer<
  typeof LearningCollectionCreateSchema
>;
