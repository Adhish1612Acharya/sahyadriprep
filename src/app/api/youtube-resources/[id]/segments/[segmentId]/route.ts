import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { deleteSegmentOrchestrator } from "@/lib/services/learning-resources/youtube";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; segmentId: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireCollectionAuth(supabase);

    const result = await deleteSegmentOrchestrator(
      supabase,
      params.segmentId,
      params.id
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  });
}
