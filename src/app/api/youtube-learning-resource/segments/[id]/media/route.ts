import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { addSegmentMediaOrchestrator } from "@/lib/services/learning-resources/youtube/manage-segments";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const result = await addSegmentMediaOrchestrator(
      request,
      supabase,
      user.id
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}
