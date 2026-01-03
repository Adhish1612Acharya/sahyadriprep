import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import { withApiHandler } from "@/lib/api/server";
import { processRAGQuery } from "@/lib/services/rag";
import { ragChatSchema, validateRequestBody } from "@/lib/zod";
import { createClient as v_createClient } from "@/lib/vector_supabase/server";
import { createClient } from "@/lib/supabase/server";
import { toCamelCase } from "@/helpers/transformers";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    // 1. Auth (throws HttpError)
    const vector_supabase = await v_createClient();
    const supabase = await createClient();
    await requireAuth(supabase);

    // 2. Validation (throws HttpError)
    const body = await validateRequestBody(request, ragChatSchema);

    // 3. Single service call (throws domain errors)
    const response = await processRAGQuery(vector_supabase, body.message, 10);

    // 4. Success response (only code that runs)
    return NextResponse.json(toCamelCase(response), { status: 200 });
  });
}
