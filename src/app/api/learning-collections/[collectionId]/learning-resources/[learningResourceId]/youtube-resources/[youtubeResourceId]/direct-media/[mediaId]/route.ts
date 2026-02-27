import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, mediaId: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from(TABLES.youtubeLearningResourceDirectMedia)
      .select(`
        *,
        media(*)
      `)
      .eq("youtube_learning_resource_id", params.id)
      .eq("id", params.mediaId)
      .single();
      
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  });
}
