import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { addSegmentMediaOrchestrator } from "@/lib/services/segment-media-attachments/orchestrator";

export async function POST(
  request: NextRequest,
  params: Promise<{
    collectionId: string;
    learningResourceId: string;
    youtubeResourceId: string;
    segmentId: string;
  }>,
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const { segmentId } = await params;

    const result = await addSegmentMediaOrchestrator(
      request,
      supabase,
      user.id,
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}
