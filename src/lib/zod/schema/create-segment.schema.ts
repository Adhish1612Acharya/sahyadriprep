import z from "zod";

export const CreateSegmentSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startTime: z.coerce.number().int().min(0),
    endTime: z.coerce.number().int().min(1),
  })
  .refine((b) => b.startTime < b.endTime, {
    message: "start_time must be less than end_time",
    path: ["startTime"],
  });

export type CreateSegmentInput = z.infer<typeof CreateSegmentSchema>;
