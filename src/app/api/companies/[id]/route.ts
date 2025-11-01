import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch single company by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

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
      //   .eq("created_by", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch company" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update company (college_admin or super_admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // 2. Check user role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "college_admin" && profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden - Only college admins can update companies" },
        { status: 403 }
      );
    }

    // 3. For college_admin, verify they own this company
    if (profile.role === "college_admin") {
      const { data: company } = await supabase
        .from("companies")
        .select("college_id, created_by")
        .eq("id", id)
        .single();

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      // Get admin's college_id
      const { data: adminProfile } = await supabase
        .from("college_admin_profiles")
        .select("college_id")
        .eq("id", user.id)
        .single();

      // Check if company belongs to admin's college
      if (company.college_id !== adminProfile?.college_id) {
        return NextResponse.json(
          {
            error:
              "Forbidden - You can only update companies from your college",
          },
          { status: 403 }
        );
      }
    }

    // 4. Parse request body
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
        { error: "Company name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate glassdoor_rating if provided
    if (glassdoor_rating !== null && glassdoor_rating !== undefined) {
      const rating = parseFloat(glassdoor_rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          { error: "Glassdoor rating must be between 0 and 5" },
          { status: 400 }
        );
      }
    }

    // Validate company_size if provided
    const validSizes = ["startup", "small", "medium", "large", "enterprise"];
    if (company_size && !validSizes.includes(company_size)) {
      return NextResponse.json(
        { error: `Company size must be one of: ${validSizes.join(", ")}` },
        { status: 400 }
      );
    }

    // 5. Update company
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

    // ✅ updated_at will be auto-updated by trigger

    const { data: company, error: updateError } = await supabase
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
      console.error("Error updating company:", updateError);

      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A company with this name already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to update company" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Company updated successfully",
        data: company,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete company (college_admin or super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // 2. Check user role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "college_admin" && profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden - Only college admins can delete companies" },
        { status: 403 }
      );
    }

    // 3. For college_admin, verify they own this company
    if (profile.role === "college_admin") {
      const { data: company } = await supabase
        .from("companies")
        .select("college_id")
        .eq("id", id)
        .single();

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      // Get admin's college_id
      const { data: adminProfile } = await supabase
        .from("college_admin_profiles")
        .select("college_id")
        .eq("id", user.id)
        .single();

      // Check if company belongs to admin's college
      if (company.college_id !== adminProfile?.college_id) {
        return NextResponse.json(
          {
            error:
              "Forbidden - You can only delete companies from your college",
          },
          { status: 403 }
        );
      }
    }

    // 4. Delete company
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting company:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete company" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
