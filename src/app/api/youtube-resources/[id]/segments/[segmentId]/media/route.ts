import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { addSegmentMediaOrchestrator } from "@/lib/services/learning-resources/youtube";

export async function POST(
  request: NextRequest,
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const result = await addSegmentMediaOrchestrator(
      request,
      supabase,
      user.id
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}
