import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validation result types
 */
export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationError = {
  success: false;
  error: NextResponse;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or error response
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    console.error("❌ Validation failed:", errors);

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      ),
    };
  }

  console.log("✅ Validation successful");

  return {
    success: true,
    data: validation.data,
  };
}

/**
 * Async version for validations that may need async operations
 */
export async function validateRequestAsync<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<ValidationResult<z.infer<T>>> {
  return validateRequest(schema, data);
}

/**
 * Extract and validate JSON body from request
 * @param request - Next.js Request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error response
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error: any) {
    console.error("❌ Failed to parse request body:", error);

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          details: error.message,
        },
        { status: 400 }
      ),
    };
  }
}
