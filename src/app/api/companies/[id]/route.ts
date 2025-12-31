import { toCamelCase } from "@/helpers/transformers";
import { withApiHandler } from "@/lib/api/server";
import { requireAdmin, requireAuth } from "@/lib/services/auth";
import {
  deleteCompanyForCollegeRequest,
  fetchCompanyLightForCollege,
  fetchCompanyWithCollegeDetailsById,
  fetchCompanyWithCollegeForCollege,
  updateCompanyForCollege,
} from "@/lib/services/companies";
import { fetchAuthProfileByUserId } from "@/lib/services/profiles";
import { createClient } from "@/lib/supabase/server";
import { updateCompanySchema, validateRequestBody } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const authUser = await requireAuth(supabase);

    const { id } = await params;
    const user = authUser;

    // User profile → throw on not found
    const userProfile = await fetchAuthProfileByUserId(supabase, user!.id);

    const userCollegeId = userProfile.college_id;

    const company = await fetchCompanyWithCollegeForCollege(
      supabase,
      id,
      userCollegeId
    );

    return NextResponse.json({
      success: true,
      data: toCamelCase(company),
    });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  withApiHandler(async () => {
    const { id } = await params;
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);

    const { user, role, profile } = authResult;
    const userCollegeId = profile.college_id;

    const body = await validateRequestBody(request, updateCompanySchema);

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
  });
}

// DELETE - Delete company (college_admin or super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  withApiHandler(async () => {
    const { id } = await params;
    const supabase = await createClient();

    // 1) Auth check (super_admin / college_admin)
    const authResult = await requireAdmin(supabase);

    const { user, role, profile } = authResult;

    const userAuthProfile = profile;

    const userCollegeId = userAuthProfile?.college_id;

    // 2) Fetch company (light) – id, name, college_id, created_by
    let company;
    if (role === "super_admin") {
      company = await fetchCompanyWithCollegeDetailsById(supabase, id);
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
  });
}
