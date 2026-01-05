import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { sendInterviewExperienceEmailService } from "@/lib/services/interview-experiences";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const formData = await request.formData();

    const result = await sendInterviewExperienceEmailService(formData);

    return NextResponse.json(
      {
        success: true,
        message: "Interview experience submitted successfully",
        data: result,
      },
      { status: 200 }
    );
  });
}
