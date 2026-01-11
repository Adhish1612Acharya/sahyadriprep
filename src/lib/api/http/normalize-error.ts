import { HttpError } from "./http-error";

export function normalizeServerError(err: any): HttpError {
  // Already HttpError
  if (err instanceof HttpError) return err;

  // Supabase/Postgres codes
  const supaCode = err?.code as string | undefined;
  if (supaCode) {
    switch (supaCode) {
      case "23505": // unique_violation
        return new HttpError(
          err.message ?? "Duplicate resource",
          409,
          "UNIQUE_VIOLATION",
          { dbCode: supaCode }
        );
      case "PGRST116": // no rows
        return new HttpError(
          err.message ?? "Resource not found",
          404,
          "NOT_FOUND",
          { dbCode: supaCode }
        );
      case "42501": // insufficient_privilege
        return new HttpError("Permission denied", 403, "FORBIDDEN", {
          dbCode: supaCode,
        });
    }
  }

  // Generic app codes from services/routes
  const appCode = err?.code as string | undefined;
  switch (appCode) {
    case "NOT_FOUND":
      return new HttpError(
        err.message ?? "Resource not found",
        404,
        "NOT_FOUND",
        err.data
      );
    case "BAD_REQUEST":
      return new HttpError(
        err.message ?? "Invalid request",
        400,
        "BAD_REQUEST",
        err.data
      );
    case "UNAUTHORIZED":
      return new HttpError(
        err.message ?? "Unauthorized",
        401,
        "UNAUTHORIZED",
        err.data
      );
  }

  // Fallback
  return new HttpError(
    err?.message ?? "Internal server error",
    500,
    "INTERNAL",
    { originalCode: supaCode ?? appCode }
  );
}

export function normalizeHttpClientError(err: any): HttpError {

  if (err instanceof HttpError) return err;

  // Axios error with backend error format
  if (err?.response?.data && typeof err.response.data === "object") {
    const { message, code, data, success } = err.response.data;
    if (success === false && message && code) {
      return new HttpError(
        message,
        err.response.status ?? 500,
        code,
        data ?? undefined 
      );
    }
  }

  // Fallback: unknown error
  return new HttpError(
    err?.message ?? "Unknown error",
    err?.response?.status ?? 500,
    "INTERNAL",
    err?.response?.data ?? undefined
  );
}
