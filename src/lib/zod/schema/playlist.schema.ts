// lib/zod/playlist-form-schemas.ts
import { z } from "zod";

export const playlistFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  subjectId: z.string().uuid().optional().nullable(),
});

export type PlaylistFormValues = z.infer<typeof playlistFormSchema>;
