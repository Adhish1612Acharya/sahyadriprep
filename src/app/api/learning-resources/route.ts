import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import {  requireCollectionAuth } from "@/lib/services/auth";
import {
  createLearningResourceOrchestrator,
} from "@/lib/services/learning-resources";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireCollectionAuth(supabase);

    const result = await createLearningResourceOrchestrator(request, supabase);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}

