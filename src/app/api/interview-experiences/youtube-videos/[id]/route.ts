import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  requireAdmin,
  requireAuth,
} from "@/lib/services/auth/auth-guards.service";
import { withApiHandler } from "@/lib/api/server";
import { getInterviewSessionDetailsForCollege } from "@/lib/services/interview-sessions";
import { fetchUserCollegeIdFromProfile } from "@/lib/services/profiles";
import { toCamelCase } from "@/helpers/transformers";
import { HttpError } from "@/lib/api/http";
import { deleteOwnCreatedInterviewSessionForCollegeService } from "@/lib/services/interview-sessions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;

    if (!id) {
      throw new HttpError("Interview Session Id is required", 400);
    }

    const supabase = await createClient();

    const authResult = await requireAuth(supabase);

    const collegeId = await fetchUserCollegeIdFromProfile(
      supabase,
      authResult.id
    );

    const interviewSession = await getInterviewSessionDetailsForCollege(
      supabase,
      id,
      collegeId
    );

    return NextResponse.json({
      success: true,
      data: toCamelCase(interviewSession),
    });
  });
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;

    if (!id) {
      throw new HttpError("Interview Session Id is required", 400);
    }

    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);

    const { user, profile } = authResult;

    const deletedInterviewSession =
      await deleteOwnCreatedInterviewSessionForCollegeService(
        supabase,
        id,
        profile.college_id,
        user.id
      );

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
      data: toCamelCase(deletedInterviewSession),
    });
  });
}
