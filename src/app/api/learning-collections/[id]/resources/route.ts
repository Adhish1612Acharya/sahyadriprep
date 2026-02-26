import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/services/auth";
import { getLearningResourcesByCollectionService } from "@/lib/services/learning-resources";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    await requireAuth(supabase);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as
      | "image"
      | "youtube"
      | "document"
      | null;

    const filters = type ? { type } : undefined;

    const data = await getLearningResourcesByCollectionService(
      supabase,
      params.id,
      filters,
    );

    return NextResponse.json({ success: true, data }, { status: 200 });
  });
}
