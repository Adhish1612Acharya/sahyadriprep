import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/services/auth/auth-session.service";
import { syncProfileToMetadata } from "@/lib/services/auth/auth-metadata.service";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import { fetchCompleteUserProfile } from "@/lib/services/profiles";
import { withApiHandler } from "@/lib/api/server";
import { getProfileUpdateSchema } from "@/helpers/validation";
import { updateUserProfile } from "@/lib/services/profiles";

export async function GET() {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireAuth(supabase); // Throws HttpError(401)
    const profile = await fetchCompleteUserProfile(supabase, user.id); // Throws HttpError(404)

    return NextResponse.json({
      success: true,
      profile: profile,
    });
  });
}

export async function PATCH(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const userRole = await getUserRole(supabase, user.id);

    // Dynamic schema by role (service handles this)
    const body = await validateRequestBody(
      request,
      getProfileUpdateSchema(userRole),
    );

    const profile = await updateUserProfile(supabase, user.id, body);
    await syncProfileToMetadata(supabase, user.id);

    return NextResponse.json({
      success: true,
      profile: profile,
    });
  });
}
