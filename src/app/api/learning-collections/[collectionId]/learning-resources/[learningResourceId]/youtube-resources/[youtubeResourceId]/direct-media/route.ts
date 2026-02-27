import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { getYoutubeLearningResourceDirectMediaWithMediaService } from "@/lib/services/youtube-learning-resource-direct-media";
import { uploadYouTubeDirectMediaOrchestrator } from "@/lib/services/youtube-learning-resource-direct-media/orchestrator";
import { youtube } from "googleapis/build/src/apis/youtube";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return withApiHandler(async () => {
    const supabase = await createClient();

    // Fetch direct media for the youtube learning resource
    const media = await getYoutubeLearningResourceDirectMediaWithMediaService(
      supabase,
      { youtube_learning_resource_id: params.id },
    );

    return NextResponse.json({ success: true, data: media }, { status: 200 });
  });
}

export async function POST(
  request: NextRequest,
  params: Promise<{
    collectionId: string;
    learningResourceId: string;
    youtubeResourceId: string;
  }>,
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const { learningResourceId, youtubeResourceId } = await params;

    const result = await uploadYouTubeDirectMediaOrchestrator(
      request,
      supabase,
      user.id,
      learningResourceId,
      youtubeResourceId,
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}
