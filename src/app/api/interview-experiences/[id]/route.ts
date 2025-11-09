import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import { createClient as v_createClient } from "@/lib/vector_supabase/server";
import { isUserSuperAdmin, requireAdmin } from "@/helpers/auth/auth.helpers";

/**
 * GET /api/interview-experiences/[id]
 * Get a single interview experience by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🔍 Fetching interview experience: ${id}`);

    const supabase = await createClient();

    // Fetch the interview experience with all related data
    const { data, error } = await supabase
      .from("interview_experiences")
      .select(
        `
        *,
        companies:company_id(id, name, logo_url, industry),
        colleges:college_id(id, name),
        document_media:document_media_id(id, url, file_name, file_type, file_size),
        video_media:video_media_id(id, url, file_name, file_type, file_size)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Interview experience not found",
          },
          { status: 404 }
        );
      }

      throw new Error(`Failed to fetch interview experience: ${error.message}`);
    }

    console.log(`✅ Fetched interview experience: ${data.id}`);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("❌ Error fetching interview experience:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch interview experience";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interview-experiences/[id]
 * Delete an interview experience and its associated media
 * Requires: Owner (created_by) or super_admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🗑️ Deleting interview experience: ${id}`);

    // ✅ Step 1: Check authentication and admin role
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    const { user, role } = authResult;
    console.log(`✅ Authenticated as ${role}: ${user.email}`);

    const supabase = await createClient();
    const v_supabase = await v_createClient();

    // ✅ Step 2: Fetch the interview experience to check ownership
    const { data: experience, error: fetchError } = await supabase
      .from("interview_experiences")
      .select(
        `
        *,
        document_media:document_media_id(id, url, public_id),
        video_media:video_media_id(id, url, public_id)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Interview experience not found",
          },
          { status: 404 }
        );
      }

      throw new Error(
        `Failed to fetch interview experience: ${fetchError.message}`
      );
    }

    // ✅ Step 3: Check ownership (only owner or super admin can delete)
    const isOwner = experience.created_by === user.id;
    const isSuperAdminUser = await isUserSuperAdmin(user.id);

    if (!isOwner && !isSuperAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message:
            "You can only delete interview experiences that you created. Super admins can delete any experience.",
        },
        { status: 403 }
      );
    }

    console.log(
      `🗑️ User ${user.email} (${role}) is deleting experience: ${
        experience.student_name || "Unknown"
      }`
    );

    // ✅ Step 4: Delete vector embeddings from vector database
    console.log("🗑️ Deleting vector embeddings...");
    const { error: vectorDeleteError } = await v_supabase
      .from("content_chunks")
      .delete()
      .eq("metadata->>interview_experience_id", id);

    if (vectorDeleteError) {
      console.error("❌ Error deleting vector embeddings:", vectorDeleteError);
      // Continue with deletion even if vector deletion fails
    } else {
      console.log("✅ Vector embeddings deleted");
    }

    // ✅ Step 5: Delete from Cloudinary
    const cloudinaryDeletions: Array<{
      publicId: string;
      resourceType: "image" | "video" | "raw";
    }> = [];

    if (experience.document_media?.public_id) {
      cloudinaryDeletions.push({
        publicId: experience.document_media.public_id,
        resourceType: "raw",
      });
    }

    if (experience.video_media?.public_id) {
      cloudinaryDeletions.push({
        publicId: experience.video_media.public_id,
        resourceType: "video",
      });
    }

    if (cloudinaryDeletions.length > 0) {
      console.log(
        `🗑️ Deleting ${cloudinaryDeletions.length} files from Cloudinary...`
      );

      for (const asset of cloudinaryDeletions) {
        try {
          const deleteResult = await deleteFromCloudinary(
            asset.publicId,
            asset.resourceType
          );

          if (deleteResult.success) {
            console.log(
              `✅ Deleted from Cloudinary: ${asset.resourceType} - ${asset.publicId}`
            );
          } else {
            console.warn(
              `⚠️ Failed to delete from Cloudinary: ${asset.publicId} - ${deleteResult.error}`
            );
          }
        } catch (cloudinaryError) {
          console.error(
            `❌ Error deleting from Cloudinary: ${asset.publicId}`,
            cloudinaryError
          );
          // Continue with deletion even if Cloudinary deletion fails
        }
      }
    }

    // ✅ Step 6: Delete media records from database
    if (experience.document_media_id) {
      const { error: docMediaError } = await supabase
        .from("media")
        .delete()
        .eq("id", experience.document_media_id);

      if (docMediaError) {
        console.error("❌ Error deleting document media:", docMediaError);
      } else {
        console.log("✅ Document media deleted");
      }
    }

    if (experience.video_media_id) {
      const { error: videoMediaError } = await supabase
        .from("media")
        .delete()
        .eq("id", experience.video_media_id);

      if (videoMediaError) {
        console.error("❌ Error deleting video media:", videoMediaError);
      } else {
        console.log("✅ Video media deleted");
      }
    }

    // ✅ Step 7: Delete the interview experience record
    const { error: deleteError } = await supabase
      .from("interview_experiences")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(
        `Failed to delete interview experience: ${deleteError.message}`
      );
    }

    console.log(`✅ Interview experience deleted: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Interview experience deleted successfully",
      data: {
        id,
        deleted_at: new Date().toISOString(),
        deleted_by: user.email,
        deleted_by_role: role,
        was_owner: isOwner,
      },
    });
  } catch (error: unknown) {
    console.error("❌ Error deleting interview experience:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete interview experience";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/interview-experiences/[id]
 * Update an interview experience (metadata only, not files)
 * Requires: Owner (created_by) or super_admin
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`📝 Updating interview experience: ${id}`);

    // ✅ Step 1: Check authentication and admin role
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    const { user, role } = authResult;
    console.log(`✅ Authenticated as ${role}: ${user.email}`);

    const supabase = await createClient();

    // ✅ Step 2: Fetch the interview experience to check ownership
    const { data: existingExperience, error: fetchError } = await supabase
      .from("interview_experiences")
      .select("id, created_by, student_name")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Interview experience not found",
          },
          { status: 404 }
        );
      }

      throw new Error(
        `Failed to fetch interview experience: ${fetchError.message}`
      );
    }

    // ✅ Step 3: Check ownership (only owner or super admin can update)
    const isOwner = existingExperience.created_by === user.id;
    const isSuperAdminUser = await isUserSuperAdmin(user.id);

    if (!isOwner && !isSuperAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message:
            "You can only update interview experiences that you created. Super admins can update any experience.",
        },
        { status: 403 }
      );
    }

    console.log(
      `📝 User ${user.email} (${role}) is updating experience: ${
        existingExperience.student_name || "Unknown"
      }`
    );

    // ✅ Step 4: Parse and validate update data
    const body = await request.json();

    const updateData: any = {};

    if (body.student_name !== undefined) {
      updateData.student_name = body.student_name;
    }

    if (body.batch) {
      updateData.batch = body.batch;
    }

    if (body.placed_year !== undefined) {
      updateData.placed_year = body.placed_year;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid fields to update",
        },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    // ✅ Step 5: Update the interview experience
    const { data, error } = await supabase
      .from("interview_experiences")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        companies:company_id(id, name, logo_url, industry),
        colleges:college_id(id, name),
        document_media:document_media_id(id, url, file_name, file_type, file_size),
        video_media:video_media_id(id, url, file_name, file_type, file_size)
      `
      )
      .single();

    if (error) {
      throw new Error(
        `Failed to update interview experience: ${error.message}`
      );
    }

    console.log(`✅ Interview experience updated: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Interview experience updated successfully",
      data,
      updated_by: user.email,
      updated_by_role: role,
      was_owner: isOwner,
    });
  } catch (error: unknown) {
    console.error("❌ Error updating interview experience:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update interview experience";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
