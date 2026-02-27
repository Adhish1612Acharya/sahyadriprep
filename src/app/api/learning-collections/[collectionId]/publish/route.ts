import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { publishLearningCollectionOrchestrator } from "@/lib/services/learning-collections";
import { requireCollectionAuth } from "@/lib/services/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);
    const collectionId = (await params).id;

    const result = await publishLearningCollectionOrchestrator(
      supabase,
      collectionId,
      user.id
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  });
}
