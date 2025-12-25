import { NextRequest, NextResponse } from "next/server";
import {
  studentProfileUpdateSchema,
  collegeAdminProfileUpdateSchema,
  superAdminProfileUpdateSchema,
} from "@/lib/zod/schema/profile.schema";
import { requireAuth } from "@/lib/services/auth/auth-guards.service";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/services/auth/auth-session.service";
import { syncProfileToMetadata } from "@/lib/services/auth/auth-metadata.service";
import { validateRequestBody } from "@/lib/zod/validateRequest";
import {
  fetchCompleteUserProfile,
  updateUserProfile,
} from "@/lib/services/profiles";

/**
 * GET /api/profile
 * Fetch current user's profile (student, college_admin, or super_admin)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    // ✅ Use auth helper
    const { error, user } = await requireAuth(supabase);
    if (error) return error;

    const userId = user!.id;

    console.log(`📖 Fetching profile for user: ${userId}`);

    const result = await fetchCompleteUserProfile(supabase, userId);

    if (result.type === "error") {
      console.error("❌ Profile not found:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    console.log(`✅ Profile fetched successfully for: ${userId}`);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("❌ Error in GET /api/profile:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update current user's profile
 * Handles student, college_admin, and super_admin profiles differently
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ✅ Auth
    const { error: authError, user } = await requireAuth(supabase);
    if (authError) return authError;

    const userId = user!.id;
    console.log(`📝 Updating profile for user: ${userId}`);

    // ✅ Get user role
    const role = await getUserRole(supabase, userId);
    if (!role) {
      console.error("❌ Role not found for user:", userId);
      return NextResponse.json(
        { success: false, error: "Profile meta not found" },
        { status: 400 }
      );
    }
    console.log(`👤 User role: ${role}`);

    // ✅ Single validation schema per role
    const schemaMap: Record<string, any> = {
      student: studentProfileUpdateSchema,
      college_admin: collegeAdminProfileUpdateSchema,
      super_admin: superAdminProfileUpdateSchema,
    };

    const schema = schemaMap[role];
    if (!schema) {
      return NextResponse.json(
        { success: false, error: "Invalid role for profile updates" },
        { status: 400 }
      );
    }

    // ✅ Validate request body
    const validation = await validateRequestBody(request, schema);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // ✅ SINGLE SERVICE CALL - Handles ALL roles
    const updateResult = await updateUserProfile(
      supabase,
      userId,
      validation.data
    );

    if (updateResult.type === "error") {
      console.error("❌ Profile update failed:", updateResult.error);
      return NextResponse.json(
        { success: false, error: updateResult.error },
        { status: 400 }
      );
    }

    console.log(`✅ ${role} profile updated: ${userId}`);

    // ✅ Sync metadata cache
    await syncProfileToMetadata(supabase, userId);

    return NextResponse.json({
      success: true,
      profile: updateResult.profile,
    });
  } catch (err: any) {
    console.error("❌ Error in PATCH /api/profile:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
