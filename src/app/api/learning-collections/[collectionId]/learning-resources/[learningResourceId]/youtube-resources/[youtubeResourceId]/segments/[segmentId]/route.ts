import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { deleteSegmentOrchestrator } from "@/lib/services/youtube-learning-resource-segments";

export async function DELETE(
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
    await requireCollectionAuth(supabase);

    const { segmentId, youtubeResourceId } = await params;

    const result = await deleteSegmentOrchestrator(
      supabase,
      segmentId,
      youtubeResourceId,
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  });
}
