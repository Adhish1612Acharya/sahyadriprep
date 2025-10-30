import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/youtube-videos/:id
 * Get a single YouTube video by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Video ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("youtube_videos")
      .select(
        `
        *,
        companies:company_id(id, name, logo_url),
        colleges:college_id(id, name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("❌ Error fetching video:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch video",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/youtube-videos/:id
 * Delete a YouTube video
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = await createClient();

    const { error } = await supabase
      .from("youtube_videos")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting video:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete video",
      },
      { status: 500 }
    );
  }
}
