import { z } from "zod";

export const LearningResourceCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["image", "document"], {
    errorMap: () => ({ message: "Type must be image or document" }),
  }),
  referenceIds: z
    .array(z.string().uuid("Reference ID must be a valid UUID"))
    .min(1, "At least one reference ID is required"),
});

export type LearningResourceCreateInput = z.infer<
  typeof LearningResourceCreateSchema
>;
