import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as v_createClient } from "@/lib/vector_supabase/server";
import {
  requireAdmin,
  requireAuth,
} from "@/lib/services/auth/auth-guards.service";
import { withApiHandler } from "@/lib/api/server";
import {
  createInterviewExperienceOrchestrator,
  listInterviewExperiencesForUser,
} from "@/lib/services/interview-experiences";
import { toCamelCase } from "@/helpers/transformers";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();

    const user = await requireAuth(supabase);

    const { searchParams } = new URL(request.url);
    const filters = {
      companyId: searchParams.get("company_id") || null,
      batch: searchParams.get("batch") || null,
      placedYear: searchParams.get("placed_year")
        ? parseInt(searchParams.get("placed_year")!)
        : null,
    };

    const result = await listInterviewExperiencesForUser({
      supabase,
      userId: user.id,
      filters,
    });

    return NextResponse.json(
      { success: true, ...toCamelCase(result) },
      { status: 200 }
    );
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    console.log("🚀 Starting interview experience upload...");

    const supabase = await createClient();
    const vectorSupabase = await v_createClient();

    const authResult = await requireAdmin(supabase);

    const { user, role } = authResult;
    console.log(`✅ Authenticated as ${role}: ${user!.email}`);

    const result = await createInterviewExperienceOrchestrator(
      request,
      supabase,
      vectorSupabase,
      user!.id
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  });
}
