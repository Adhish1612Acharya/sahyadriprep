import z from "zod";

export const createYouTubeMetadataSchema = z.object({
  link: z.string().url("Valid YouTube link is required"),
  segmentsAvailable: z.boolean().default(false),
});

export type CreateYouTubeMetadataInput = z.infer<
  typeof createYouTubeMetadataSchema
>;
