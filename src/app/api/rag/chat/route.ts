import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import { withApiHandler } from "@/lib/api/server";
import { processRAGQuery } from "@/lib/services/rag";
import { ragChatSchema, validateRequestBody } from "@/lib/zod";
import { createClient } from "@/lib/vector_supabase/server";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    // 1. Auth (throws HttpError)
    const supabase = await createClient();
    await requireAuth(supabase);

    // 2. Validation (throws HttpError)
    const body = await validateRequestBody(request, ragChatSchema);

    // 3. Single service call (throws domain errors)
    const response = await processRAGQuery(supabase, body.message, 10);

    // 4. Success response (only code that runs)
    return NextResponse.json(response, { status: 200 });
  });
}
