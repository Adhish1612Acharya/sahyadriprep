import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import { uploadDirectMediaOrchestrator } from "@/lib/services/learning-resources";

export async function POST(
  request: NextRequest,
  params: Promise<{ id: string }>,
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const { id: resourceId } = await params;

    const result = await uploadDirectMediaOrchestrator(
      request,
      supabase,
      user.id,
      resourceId,
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}
