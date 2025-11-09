import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, hasCollegeAccess } from "@/helpers/auth/auth.helpers";

// GET - Fetch single company by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("companies")
      .select(
        `
        *,
        colleges (
          id,
          name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Company not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch company" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update company (college_admin or super_admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`📝 Updating company: ${id}`);

    // ✅ Step 1: Check authentication and admin role
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    const { user, role } = authResult;
    console.log(`✅ Authenticated as ${role}: ${user.email}`);

    const supabase = await createClient();

    // ✅ Step 2: Fetch the company to check ownership
    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("id, name, college_id, created_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Company not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch company: ${fetchError.message}`);
    }

    // ✅ Step 3: Check college access for college_admin
    if (role === "college_admin") {
      const hasAccess = await hasCollegeAccess(user.id, company.college_id);

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "You can only update companies from your college",
          },
          { status: 403 }
        );
      }

      console.log(
        `✅ College admin has access to college: ${company.college_id}`
      );
    }

    console.log(
      `📝 User ${user?.email} (${role}) is updating company: ${company.name}`
    );

    // ✅ Step 4: Parse and validate request body
    const body = await request.json();
    const {
      name,
      logo_url,
      website,
      industry,
      headquarters,
      company_size,
      glassdoor_rating,
    } = body;

    // Validate if name is provided
    if (name !== undefined && name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Company name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate glassdoor_rating if provided
    if (glassdoor_rating !== null && glassdoor_rating !== undefined) {
      const rating = parseFloat(glassdoor_rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Glassdoor rating must be between 0 and 5",
          },
          { status: 400 }
        );
      }
    }

    // Validate company_size if provided
    const validSizes = ["startup", "small", "medium", "large", "enterprise"];
    if (company_size && !validSizes.includes(company_size)) {
      return NextResponse.json(
        {
          success: false,
          error: `Company size must be one of: ${validSizes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ Step 5: Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (logo_url !== undefined) updateData.logo_url = logo_url?.trim() || null;
    if (website !== undefined) updateData.website = website?.trim() || null;
    if (industry !== undefined) updateData.industry = industry?.trim() || null;
    if (headquarters !== undefined)
      updateData.headquarters = headquarters?.trim() || null;
    if (company_size !== undefined) updateData.company_size = company_size;
    if (glassdoor_rating !== undefined)
      updateData.glassdoor_rating = glassdoor_rating
        ? parseFloat(glassdoor_rating)
        : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // ✅ Step 6: Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        colleges (
          id,
          name
        )
      `
      )
      .single();

    if (updateError) {
      console.error("❌ Error updating company:", updateError);

      if (updateError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "A company with this name already exists" },
          { status: 409 }
        );
      }

      throw new Error(`Failed to update company: ${updateError.message}`);
    }

    console.log(`✅ Company updated: ${id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Company updated successfully",
        data: updatedCompany,
        updated_by: user?.email,
        updated_by_role: role,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ Error updating company:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update company";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete company (college_admin or super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🗑️ Deleting company: ${id}`);

    // ✅ Step 1: Check authentication and admin role
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    const { user, role } = authResult;
    console.log(`✅ Authenticated as ${role}: ${user.email}`);

    const supabase = await createClient();

    // ✅ Step 2: Fetch the company to check ownership
    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("id, name, college_id, created_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Company not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch company: ${fetchError.message}`);
    }

    // ✅ Step 3: Check college access for college_admin
    if (role === "college_admin") {
      const hasAccess = await hasCollegeAccess(user.id, company.college_id);

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "You can only delete companies from your college",
          },
          { status: 403 }
        );
      }

      console.log(
        `✅ College admin has access to college: ${company.college_id}`
      );
    }

    console.log(
      `🗑️ User ${user.email} (${role}) is deleting company: ${company.name}`
    );

    // ✅ Step 4: Check for dependencies (interview experiences, YouTube videos)
    const { data: interviewExperiences, error: experiencesError } =
      await supabase
        .from("interview_experiences")
        .select("id")
        .eq("company_id", id)
        .limit(1);

    if (experiencesError) {
      throw new Error(
        `Failed to check interview experiences: ${experiencesError.message}`
      );
    }

    if (interviewExperiences && interviewExperiences.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete company",
          message:
            "This company has associated interview experiences. Please delete them first.",
        },
        { status: 409 }
      );
    }

    const { data: youtubeVideos, error: videosError } = await supabase
      .from("youtube_videos")
      .select("id")
      .eq("company_id", id)
      .limit(1);

    if (videosError) {
      throw new Error(`Failed to check YouTube videos: ${videosError.message}`);
    }

    if (youtubeVideos && youtubeVideos.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete company",
          message:
            "This company has associated YouTube videos. Please delete them first.",
        },
        { status: 409 }
      );
    }

    // ✅ Step 5: Delete company
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete company: ${deleteError.message}`);
    }

    console.log(`✅ Company deleted: ${id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Company deleted successfully",
        data: {
          id,
          deleted_at: new Date().toISOString(),
          deleted_by: user.email,
          deleted_by_role: role,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ Error deleting company:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete company";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
