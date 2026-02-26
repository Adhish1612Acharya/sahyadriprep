import { z } from "zod";

export const YoutubeLearningResourceSchema = z.object({
  youtubeVideoId: z.string().min(1),
  segmentsAvailable: z.boolean(),
  directMediaResourcesAvailable: z.boolean()
});

export type YoutubeLearningResourceInput = z.infer<typeof YoutubeLearningResourceSchema>;