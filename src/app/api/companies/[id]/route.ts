import { toCamelCase } from "@/helpers/transformers";
import {
  fetchCompanyWithCollegeById,
  fetchCompanyWithCollegeForCollegeById,
} from "@/lib/repositories/companies";
import { requireAdmin, requireAuth } from "@/lib/services/auth";

import {
  deleteCompanyForCollegeRequest,
  fetchCompanyLightForCollege,
  updateCompanyForCollege,
} from "@/lib/services/companies";
import { fetchAuthProfileByUserId } from "@/lib/services/profiles";
import { createClient } from "@/lib/supabase/server";
import { updateCompanySchema, validateRequestBody } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch single company by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const auth = await requireAuth(supabase);

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    const user = auth.user;

    const userProfile = await fetchAuthProfileByUserId(supabase, user!.id);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    const userCollegeId = userProfile?.college_id;

    const company = await fetchCompanyWithCollegeForCollegeById(
      supabase,
      id,
      userCollegeId
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: toCamelCase(company),
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
    const supabase = await createClient();

    // 1) Auth + role + profile (with college_id)
    const authResult = await requireAdmin(supabase);
    if (authResult.error) {
      return authResult.error;
    }

    const { user, role, profile } = authResult;
    const userCollegeId = profile.college_id;

    const validationResult = await validateRequestBody(
      request,
      updateCompanySchema
    );

    if (!validationResult.success) {
      const firstError = validationResult.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message ?? "Invalid request body",
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const body = validationResult.data;

    // 3) Ensure company belongs to this college (for college_admin) or exists (for super_admin)

    let company;
    if (role === "super_admin") {
      company = await fetchCompanyWithCollegeById(supabase, id);
    } else {
      company = await fetchCompanyLightForCollege(supabase, id, userCollegeId);
    }

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // 4) Service: apply business rules + update
    const result = await updateCompanyForCollege({
      supabase,
      companyId: id,
      collegeId: userCollegeId,
      body,
      updatedByUserId: user.id,
      updatedByRole: role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company updated successfully",
        data: toCamelCase(result.data),
        updatedBy: result.updated_by,
        updatedByRole: result.updated_by_role,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error updating company:", error);

    // Optional explicit mappings
    if (error?.code === "DUPLICATE_NAME") {
      return NextResponse.json(
        { success: false, error: "A company with this name already exists" },
        { status: 409 }
      );
    }
    if (error?.code === "NO_FIELDS") {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Failed to update company",
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
    const supabase = await createClient();

    // 1) Auth check (super_admin / college_admin)
    const authResult = await requireAdmin(supabase);
    if (authResult.error) {
      return authResult.error;
    }

    const { user, role, profile } = authResult;

    const userAuthProfile = profile;

    const userCollegeId = userAuthProfile?.college_id;

    // 2) Fetch company (light) – id, name, college_id, created_by
    let company;
    if (role === "super_admin") {
      company = await fetchCompanyWithCollegeById(supabase, id);
    } else {
      company = await fetchCompanyLightForCollege(supabase, id, userCollegeId);
    }

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // 3) Call service to handle dependency checks + delete
    const result = await deleteCompanyForCollegeRequest(
      supabase,
      id,
      user.id,
      role,
      userCollegeId
    );

    return NextResponse.json(
      {
        success: true,
        message: "Company deleted successfully",
        data: toCamelCase(result.data),
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
