import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUserSuperAdmin, requireAdmin } from "@/helpers/auth.helpers";

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
 * Delete a YouTube video (only owner or super admin can delete)
 */
export async function DELETE(
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

    // ✅ Step 1: Check authentication and admin role
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    const { user, role } = authResult;
    console.log(`✅ Authenticated as ${role}: ${user.email}`);

    const supabase = await createClient();

    // ✅ Step 2: Fetch the video to check ownership
    const { data: video, error: fetchError } = await supabase
      .from("youtube_videos")
      .select("id, created_by, title")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch video: ${fetchError.message}`);
    }

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          error: "Video not found",
        },
        { status: 404 }
      );
    }

    // ✅ Step 3: Check ownership (only owner or super admin can delete)
    const isOwner = video.created_by === user.id;
    const isSuperAdminUser = await isUserSuperAdmin(user.id);

    if (!isOwner && !isSuperAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message:
            "You can only delete videos that you created. Super admins can delete any video.",
        },
        { status: 403 }
      );
    }

    console.log(
      `🗑️ User ${user.email} (${role}) is deleting video: ${video.title}`
    );

    // ✅ Step 4: Delete the video
    const { error: deleteError } = await supabase
      .from("youtube_videos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete video: ${deleteError.message}`);
    }

    console.log(`✅ Video deleted successfully: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
      deleted_by: user.email,
      deleted_by_role: role,
      was_owner: isOwner,
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
