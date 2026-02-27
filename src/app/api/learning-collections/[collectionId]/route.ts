import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireCollectionAuth } from "@/lib/services/auth";
import {
  getLearningCollectionByIdService,
  deleteLearningCollectionOrchestrator,
} from "@/lib/services/learning-collections";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const supabase = await createClient();
    await requireAuth(supabase);

    const collection = await getLearningCollectionByIdService(supabase, id);

    return NextResponse.json(
      { success: true, data: collection },
      { status: 200 },
    );
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const result = await deleteLearningCollectionOrchestrator(
      supabase,
      id,
      user.id,
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  });
}
