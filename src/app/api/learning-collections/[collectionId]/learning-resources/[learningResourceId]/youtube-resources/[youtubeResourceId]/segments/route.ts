import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import {
  createSegmentOrchestrator,
  getSegmentsOrchestrator,
} from "@/lib/services/youtube-learning-resource-segments";

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

    const { collectionId, learningResourceId, youtubeResourceId } =
      await params;

    const result = await createSegmentOrchestrator(
      request,
      supabase,
      user.id,
      collectionId,
      learningResourceId,
      youtubeResourceId,
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireCollectionAuth(supabase);

    const segments = await getSegmentsOrchestrator(request, supabase);

    return NextResponse.json(
      { success: true, data: segments },
      { status: 200 },
    );
  });
}
