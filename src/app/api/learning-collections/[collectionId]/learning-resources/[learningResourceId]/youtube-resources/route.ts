import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { createYouTubeMetadataOrchestrator } from "@/lib/services/youtube-learning-resources";

export async function POST(
  request: NextRequest,
  { params }: { params: { collectionId: string; learningResourceId: string } },
) {
  return withApiHandler(async () => {
    const supabase = await createClient();

    const user = await requireCollectionAuth(supabase);

    const { collectionId, learningResourceId } = await params;

    const result = await createYouTubeMetadataOrchestrator(
      request,
      supabase,
      user.id,
      collectionId,
      learningResourceId,
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}
