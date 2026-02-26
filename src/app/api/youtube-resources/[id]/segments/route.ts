import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import {
  createSegmentOrchestrator,
  getSegmentsOrchestrator,
} from "@/lib/services/learning-resources/youtube";

export async function POST(
  request: NextRequest,
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireCollectionAuth(supabase);

    const result = await createSegmentOrchestrator(request, supabase);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}

export async function GET(
  request: NextRequest,
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireCollectionAuth(supabase);

    const segments = await getSegmentsOrchestrator(request, supabase);

    return NextResponse.json({ success: true, data: segments }, { status: 200 });
  });
}
