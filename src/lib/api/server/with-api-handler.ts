import { NextResponse } from "next/server";
import { normalizeError } from "../http";

export async function withApiHandler(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error: any) {
    const normalized = normalizeError(error);

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
