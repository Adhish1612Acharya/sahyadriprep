import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { deleteSegmentOrchestrator } from "@/lib/services/learning-resources/youtube/manage-segments";
import { patchSegment } from "@/lib/repositories/youtube-learning-resources/segments";
import { handleSupabaseResult } from "@/helpers/supabase";
import { TABLES } from "@/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from(TABLES.youtubeLearningResourceSegments)
      .select(`
        *,
        segment_media_attachments(*, media(*))
      `)
      .eq("id", params.id)
      .single();
      
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireAuth(supabase);
    
    const body = await request.json();
    const { data, error } = await patchSegment(supabase, params.id, body);
    
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireAuth(supabase);

    // We need the youtube_learning_resource_id for recounting and publishable flag update
    const { data: segment } = await supabase
      .from(TABLES.youtubeLearningResourceSegments)
      .select("youtube_learning_resource_id")
      .eq("id", params.id)
      .single();
      
    if (!segment) throw new Error("Segment not found");

    const result = await deleteSegmentOrchestrator(
      supabase,
      params.id,
      segment.youtube_learning_resource_id
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  });
}
