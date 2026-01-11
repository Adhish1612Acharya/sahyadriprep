import { HttpError } from "@/lib/api/http";

export function handleSupabaseResult<T>(
  result: { data: T | null; error: any | null },
  mode: "strict" | "lenient" = "strict",
  resourceName: string,
  extraData?: any
): T {
  const { data, error } = result;

  // Not found (PGRST116)
  if (error?.code === "PGRST116") {
    if (mode === "strict") {
      throw new HttpError(
        `${resourceName} not found`,
        404,
        ` ${resourceName.toUpperCase()}_NOT_FOUND`,
        extraData
      );
    }
    return null as T; // lenient
  }

  // Real DB errors → always throw
  if (error) {
    throw new HttpError(
      `Failed to fetch ${resourceName.toLowerCase()}: ${error.message}`,
      500,
      "DB_ERROR",
      { dbCode: error.code }
    );
  }

  // No data
  if (!data) {
    if (mode === "strict") {
      throw new HttpError(
        `${resourceName} not found`,
        404,
        ` ${resourceName.toUpperCase()}_NOT_FOUND`,
        extraData
      );
    }
    return null as T;
  }

  return data;
}
