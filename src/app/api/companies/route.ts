import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { companySchema } from "@/lib/zod/schema/company.schema";
import {
  requireAdmin,
  requireAuth,
} from "@/lib/services/auth/auth-guards.service";
import { fetchAuthProfileByUserId } from "@/lib/services/profiles";
import {
  createCompanyForCollege,
  listCompaniesForUser,
} from "@/lib/services/companies";
import { withApiHandler } from "@/lib/api/server";
import { validateRequestBody } from "@/lib/zod";
import { toCamelCase } from "@/helpers/transformers";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    const userAuthProfile = await fetchAuthProfileByUserId(supabase, user.id);

    // Extract filters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") ?? undefined,
      industry: searchParams.get("industry") ?? undefined,
    };

    // Service handles EVERYTHING
    const companies = await listCompaniesForUser(
      supabase,
      userAuthProfile.college_id,
      userAuthProfile.role === "super_admin",
      filters
    );

    return NextResponse.json({
      success: true,
      companies: toCamelCase(companies),
    });
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);

    const body = await validateRequestBody(request, companySchema);

    const company = await createCompanyForCollege(
      supabase,
      body,
      authResult.user.id,
      authResult.profile.college_id
    );

    return NextResponse.json(
      {
        success: true,
        message: "Company created successfully",
        data: toCamelCase(company),
      },
      { status: 201 }
    );
  });
}
