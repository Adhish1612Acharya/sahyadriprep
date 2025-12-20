import { validateRequest } from "@/helpers/validation/validate-zod";
import { NextRequest } from "next/server";
import z from "zod";

export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
) {
  const body = await request.json();
  return validateRequest(schema, body);
}
