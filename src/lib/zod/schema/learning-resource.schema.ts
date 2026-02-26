import { z } from "zod";

export const LearningResourceCreateSchema = z.object({
    collectionId: z.string().uuid("Collection ID must be a valid UUID"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    type: z.enum(["image", "document", "youtube"], {
      errorMap: () => ({ message: "Type must be image, document, or youtube" }),
    }),
});


export type LearningResourceCreateInput = z.infer<
  typeof LearningResourceCreateSchema
>;
