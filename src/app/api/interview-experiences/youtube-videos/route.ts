import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as v_createClient } from "@/lib/vector_supabase/server";
import {
  requireAdmin,
  requireAuth,
} from "@/lib/services/auth/auth-guards.service";
import { withApiHandler } from "@/lib/api/server";
import { getInterviewSessionsForCollege } from "@/lib/services/interview-sessions";
import { fetchUserCollegeIdFromProfile } from "@/lib/services/profiles";
import { createInterviewSessionForCollegeOrchestrator } from "@/lib/services/interview-sessions";
import { HttpError } from "@/lib/api/http";
import { toCamelCase } from "@/helpers/transformers";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    const filters = {};

    Object.assign(filters, companyId ? { companyId } : {});

    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const userId = user.id;

    const collegeId = await fetchUserCollegeIdFromProfile(supabase, userId);

    const videos = await getInterviewSessionsForCollege(
      supabase,
      collegeId,
      filters
    );

    return NextResponse.json({ success: true, data: toCamelCase(videos) });
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const body = await request.json();
    const { videoUrl, companyId } = body;

    if (!videoUrl) {
      throw new HttpError("videoUrl is required", 400);
    }

    if (!companyId) {
      throw new HttpError("companyId is required", 400);
    }

    const supabase = await createClient();
    const vectorSupabase = await v_createClient();

    const authResult = await requireAdmin(supabase);
    const { profile, user } = authResult;

    const collegeId = profile.college_id;
    const userId = user.id;

    const result = await createInterviewSessionForCollegeOrchestrator(
      supabase,
      vectorSupabase,
      videoUrl,
      companyId,
      collegeId,
      userId
    );

    return NextResponse.json(
      {
        success: true,
        message: "Interview session created successfully",
        data: {
          interviewSession: toCamelCase(result.newInterviewSession),
          ragChunksCreated: toCamelCase(result.interviewSessionRagContent.length),
          message: `Processed ${result.interviewSessionRagContent.length} RAG chunks`,
        },
      },
      { status: 201 }
    );
  });
}
