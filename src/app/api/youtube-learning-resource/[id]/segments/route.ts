import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { createSegmentOrchestrator, getSegmentsOrchestrator } from "@/lib/services/learning-resources/youtube/manage-segments";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const result = await createSegmentOrchestrator(
      request,
      supabase,
      user.id
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    
    const result = await getSegmentsOrchestrator(request, supabase);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  });
}
