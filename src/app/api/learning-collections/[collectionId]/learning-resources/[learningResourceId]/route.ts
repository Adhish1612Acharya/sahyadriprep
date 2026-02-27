import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/services/auth";
import { getLearningResourceWithExtensionsOrchestrator} from "@/lib/services/learning-resources/orchestrator";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireAuth(supabase);

    const data = await getLearningResourceWithExtensionsOrchestrator(
      supabase,
      params.id
    );

    return NextResponse.json({ success: true, data }, { status: 200 });
  });
}
