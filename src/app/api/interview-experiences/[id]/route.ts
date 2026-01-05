import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as v_createClient } from "@/lib/vector_supabase/server";
import { requireAdmin, requireAuth } from "@/lib/services/auth";
import { withApiHandler } from "@/lib/api/server";
import { fetchAuthProfileByUserId } from "@/lib/services/profiles";
import {
  deleteInterviewExperienceOrchestrator,
  getInterviewExperienceDetailsForCollege,
} from "@/lib/services/interview-experiences";
import { toCamelCase } from "@/helpers/transformers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const supabase = await createClient();

    const authResult = await requireAuth(supabase);

    const userProfile = await fetchAuthProfileByUserId(supabase, authResult.id);

    const collegeId = userProfile.college_id;

    const experience = await getInterviewExperienceDetailsForCollege(
      supabase,
      id,
      collegeId
    );

    return NextResponse.json({ success: true, data: toCamelCase(experience) });
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const supabase = await createClient();
    const vectorSupabase = await v_createClient();

    const authResult = await requireAdmin(supabase);

    const { user, profile } = authResult;
    const collegeId = profile.college_id;
 
    const result = await deleteInterviewExperienceOrchestrator(
      supabase,
      vectorSupabase,
      user.id,
      collegeId,
      id
    );

    return NextResponse.json(
      {
        success: true,
        message: "Interview experience deleted successfully",
        data: toCamelCase(result),
      },
      { status: 200 }
    );
  });
}
