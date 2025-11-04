import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { companySchema } from "@/lib/validations/company.schema";
import { requireAdmin } from "@/helpers/auth.helpers";

// GET - Fetch all companies (authenticated users only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Check authentication and get user
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

    // 2. Get user's role and college_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Get college_id based on role
    let userCollegeId = null;

    if (profile.role === "student") {
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("college_id")
        .eq("id", user.id)
        .single();

      userCollegeId = studentProfile?.college_id;
    } else if (profile.role === "college_admin") {
      const { data: adminProfile } = await supabase
        .from("college_admin_profiles")
        .select("college_id")
        .eq("id", user.id)
        .single();

      userCollegeId = adminProfile?.college_id;
    }
    // super_admin can see all companies (userCollegeId remains null)

    // 4. Optional: Get search params for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const industry = searchParams.get("industry");

    let query = supabase
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
      .order("name", { ascending: true });

    // 5. Filter by user's college (unless super_admin)
    if (userCollegeId && profile.role !== "super_admin") {
      query = query.eq("college_id", userCollegeId);
    }

    // 6. Apply additional filters if provided
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (industry) {
      query = query.eq("industry", industry);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching companies:", error);
      return NextResponse.json(
        { error: "Failed to fetch companies" },
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

// POST - Add new company (college_admin or super_admin only)
export async function POST(request: NextRequest) {
  try {
    // ✅ Step 1: Check authentication and admin role
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    const supabase = await createClient();

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

    // 2. Check user role and get college_id
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
        { error: "Forbidden - Only college admins can add companies" },
        { status: 403 }
      );
    }

    // 3. Get college_id from college_admin_profiles
    let college_id = null;

    if (profile.role === "college_admin") {
      const { data: adminProfile, error: adminError } = await supabase
        .from("college_admin_profiles")
        .select("college_id")
        .eq("id", user.id)
        .single();

      if (adminError || !adminProfile) {
        return NextResponse.json(
          { error: "College admin profile not found" },
          { status: 404 }
        );
      }

      college_id = adminProfile.college_id;
    }
    // For super_admin, college_id can be null or provided in request

    // 4. Parse and validate request body with Zod
    const body = await request.json();

    const validationResult = companySchema.safeParse(body);

    if (!validationResult.success) {
      // Return first validation error
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          field: firstError.path.join("."),
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // 5. Insert company into database with new columns
    const { data: company, error: insertError } = await supabase
      .from("companies")
      .insert([
        {
          name: validatedData.name,
          logo_url: validatedData.logo_url || null,
          website: validatedData.website || null,
          industry: validatedData.industry || null,
          headquarters: validatedData.headquarters || null,
          company_size: validatedData.company_size || null,
          glassdoor_rating: validatedData.glassdoor_rating || null,
          college_id: college_id,
          created_by: user.id,
        },
      ])
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

    if (insertError) {
      console.error("Error inserting company:", insertError);

      // Handle unique constraint violation (duplicate company name)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A company with this name already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to add company" },
        { status: 500 }
      );
    }

    // 6. Return success response
    return NextResponse.json(
      {
        message: "Company added successfully",
        data: company,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
