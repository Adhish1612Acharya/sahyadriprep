import { z } from "zod";
import { HttpError } from "@/lib/api/http";

export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: any
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new HttpError(
      firstError?.message ?? "Invalid request body",
      400,
      "BAD_REQUEST",
      { details: result.error.errors }
    );
  }

  return result.data;
}
