import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { requireCollectionAuth } from "@/lib/services/auth/auth-guards.service";
import {
  createLearningCollectionOrchestrator,
  getLearningCollectionsService,
} from "@/lib/services/learning-collections";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const result = await createLearningCollectionOrchestrator(
      request,
      supabase,
      user.id,
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  });
}

export async function GET() {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireCollectionAuth(supabase);

    const collections = await getLearningCollectionsService(supabase, {
      createdBy: user.id,
    });

    return NextResponse.json(
      { success: true, data: collections },
      { status: 200 },
    );
  });
}
