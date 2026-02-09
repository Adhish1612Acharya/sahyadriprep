import { validateRequest } from "@/helpers/validation/validate-zod";
import { NextRequest } from "next/server";
import z from "zod";
import { HttpError } from "../api/http";

export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let body: any;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries());
  } else {
    body = await request.json();
  }


  const result = validateRequest(schema, body);

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
