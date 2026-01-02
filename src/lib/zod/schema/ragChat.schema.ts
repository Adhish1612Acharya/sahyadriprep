import { z } from "zod";

export const ragChatSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000),
});
