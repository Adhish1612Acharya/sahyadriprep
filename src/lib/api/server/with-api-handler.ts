import { NextResponse } from "next/server";
import { normalizeServerError } from "@/lib/api/http";
import { toCamelCase } from "@/helpers/transformers";

export async function withApiHandler(handler: () => Promise<NextResponse>) {
  try {
    const response = await handler();

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(toCamelCase(data), {
        status: response.status,
        headers: response.headers,
      });
    }

    return response;
  } catch (error: any) {
    if (
      error.message === "NEXT_REDIRECT" ||
      error.digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("API Handler Error:", error);
    const normalized = normalizeServerError(error);

    return NextResponse.json(
      {
        success: false,
        message: normalized.message,
        code: normalized.code,
        data: normalized.data,
      },
      { status: normalized.status },
    );
  }
}
