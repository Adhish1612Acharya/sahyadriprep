import { z } from "zod";

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "File is required");

export const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),

  // ✅ topics as array of strings
  topics: z
    .array(z.string().min(1, "Topic cannot be empty"))
    .min(1, "At least one topic is required")
    .optional()
    .nullable(),

  subjectId: z.string().uuid().optional().nullable(),

  // Files
  video: fileSchema, // required
  notes: fileSchema, // required (main notes)
  thumbnail: fileSchema, // required
  revisionMaterial: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Invalid file")
    .optional()
    .nullable(), // optional

  confirmNotebooklmOnly: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm these are generated using NotebookLM.",
    }),
  }),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
