import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { getYouTubeDirectMediaService } from "@/lib/services/learning-resources/youtube/fetch";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    
    // Fetch direct media for the youtube learning resource
    const media = await getYouTubeDirectMediaService(supabase, params.id);

    return NextResponse.json({ success: true, data: media }, { status: 200 });
  });
}
