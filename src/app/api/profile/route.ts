import { NextRequest, NextResponse } from "next/server";
import { fetchProfileByUserId } from "@/helpers/database/profiles/fetch.server";
import {
  updateStudentProfile,
  updateCollegeAdminProfile,
} from "@/helpers/database/profiles/update";
import {
  requireAuth,
  getUserRole,
  syncProfileToMetadata,
} from "@/helpers/auth/auth.helpers";
import {
  studentProfileUpdateSchema,
  collegeAdminProfileUpdateSchema,
  superAdminProfileUpdateSchema,
} from "@/lib/validations/profile.schema";
import { validateRequestBody } from "@/helpers/validation";

/**
 * GET /api/profile
 * Fetch current user's profile (student, college_admin, or super_admin)
 */
export async function GET() {
  try {
    // ✅ Use auth helper
    const { error, user } = await requireAuth();
    if (error) return error;

    const userId = user!.id;

    console.log(`📖 Fetching profile for user: ${userId}`);

    const result = await fetchProfileByUserId(userId);

    if ((result as any).error) {
      console.error("❌ Profile not found:", (result as any).error);
      return NextResponse.json(
        {
          success: false,
          error: (result as any).error,
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
    // ✅ Use auth helper
    const { error: authError, user } = await requireAuth();
    if (authError) return authError;

    const userId = user!.id;

    console.log(`📝 Updating profile for user: ${userId}`);

    // ✅ Get user role
    const role = await getUserRole(userId);

    if (!role) {
      console.error("❌ Role not found for user:", userId);
      return NextResponse.json(
        {
          success: false,
          error: "Profile meta not found",
        },
        { status: 400 }
      );
    }

    console.log(`👤 User role: ${role}`);

    // ✅ Handle student profile update
    if (role === "student") {
      // ✅ Validate request body
      const validation = await validateRequestBody(
        request,
        studentProfileUpdateSchema
      );

      if (!validation.success) {
        return validation.error; // Returns formatted error response
      }

      const { profile, error: updateError } = await updateStudentProfile(
        userId,
        validation.data
      );

      if (updateError) {
        console.error("❌ Student profile update failed:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: updateError,
          },
          { status: 400 }
        );
      }

      console.log(`✅ Student profile updated: ${userId}`);

      // ✅ Sync to metadata cache
      await syncProfileToMetadata(userId);

      return NextResponse.json({
        success: true,
        profile,
      });
    }

    // ✅ Handle college admin profile update
    if (role === "college_admin") {
      // ✅ Validate request body
      const validation = await validateRequestBody(
        request,
        collegeAdminProfileUpdateSchema
      );

      if (!validation.success) {
        return validation.error; // Returns formatted error response
      }

      const { profile, error: updateError } = await updateCollegeAdminProfile(
        userId,
        validation.data
      );

      if (updateError) {
        console.error("❌ College admin profile update failed:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: updateError,
          },
          { status: 400 }
        );
      }

      console.log(`✅ College admin profile updated: ${userId}`);

      // ✅ Sync to metadata cache
      await syncProfileToMetadata(userId);

      return NextResponse.json({
        success: true,
        profile,
      });
    }

    // ✅ Handle super admin profile update (limited fields)
    if (role === "super_admin") {
      // ✅ Validate request body
      const validation = await validateRequestBody(
        request,
        superAdminProfileUpdateSchema
      );

      if (!validation.success) {
        return validation.error; // Returns formatted error response
      }

      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          ...validation.data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Super admin profile update failed:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: updateError.message,
          },
          { status: 400 }
        );
      }

      console.log(`✅ Super admin profile updated: ${userId}`);

      // ✅ Sync to metadata cache
      await syncProfileToMetadata(userId);

      return NextResponse.json({
        success: true,
        profile: data,
      });
    }

    // ✅ Unknown role
    console.error("❌ Unknown role:", role);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid user role",
      },
      { status: 400 }
    );
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
