import z from "zod";

export const addSegmentMediaSchema = z.object({
  label: z.string().optional(),
  file: z
    .instanceof(File)
    .refine(
      (f) =>
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
          "application/pdf",
        ].includes(f.type),
      { message: "File must be PNG, JPG, WEBP, or PDF" },
    )
    .refine((f) => f.size <= 10 * 1024 * 1024, {
      message: "File must be less than 10 MB",
    }),
});

export type AddSegmentMediaInput = z.infer<typeof addSegmentMediaSchema>;
