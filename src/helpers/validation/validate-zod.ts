import { z } from "zod";

export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: any
): z.SafeParseReturnType<T["_input"], T["_output"]> {
  const result = schema.safeParse(data);

  return result;
}
