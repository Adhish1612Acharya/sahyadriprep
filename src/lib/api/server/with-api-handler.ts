import { NextResponse } from "next/server";
import { normalizeServerError } from "@/lib/api/http";

export async function withApiHandler(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error: any) {
    console.error("API Handler Error:", error);
    const normalized = normalizeServerError(error);

    return NextResponse.json(
      {
        success: false,
        message: normalized.message,
        code: normalized.code,
        data: normalized.data,
      },
      { status: normalized.status }
    );
  }
}
