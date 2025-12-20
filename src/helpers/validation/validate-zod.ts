import { z } from "zod";
import { ValidationError, ValidationSuccess } from "./types";

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    return { success: false, errors };
  }

  return { success: true, data: result.data };
}
