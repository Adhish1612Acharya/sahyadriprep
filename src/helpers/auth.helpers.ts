import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Check if the current user is authenticated
 * @returns User object or null
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get user's role from the profiles table
 * @param userId - User's ID
 * @returns User role or null
 */
export async function getUserRole(userId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    console.error("Error fetching user role:", error);
    return null;
  }

  return profile.role as "student" | "college_admin" | "super_admin";
}

/**
 * Check if user is an admin (college_admin or super_admin)
 * @param userId - User's ID
 * @returns Boolean indicating if user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "college_admin" || role === "super_admin";
}

/**
 * Check if user is a super admin
 * @param userId - User's ID
 * @returns Boolean indicating if user is super admin
 */
export async function isUserSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "super_admin";
}

/**
 * Middleware to check if user is authenticated
 * Returns error response if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "You must be logged in to perform this action",
        },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Middleware to check if user is an admin (college_admin or super_admin)
 * Returns error response if not admin
 */
export async function requireAdmin() {
  const { error, user } = await requireAuth();

  if (error) {
    return { error, user: null, role: null };
  }

  const role = await getUserRole(user!.id);

  if (!role || (role !== "college_admin" && role !== "super_admin")) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message:
            "Only college admins and super admins can perform this action",
        },
        { status: 403 }
      ),
      user: null,
      role: null,
    };
  }

  return { error: null, user, role };
}

/**
 * Middleware to check if user is a super admin
 * Returns error response if not super admin
 */
export async function requireSuperAdmin() {
  const { error, user } = await requireAuth();

  if (error) {
    return { error, user: null, role: null };
  }

  const role = await getUserRole(user!.id);

  if (role !== "super_admin") {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Only super admins can perform this action",
        },
        { status: 403 }
      ),
      user: null,
      role: null,
    };
  }

  return { error: null, user, role };
}

/**
 * Check if user has access to a specific college's resources
 * @param userId - User's ID
 * @param collegeId - College ID to check access for
 * @returns Boolean indicating if user has access
 */
export async function hasCollegeAccess(
  userId: string,
  collegeId: string
): Promise<boolean> {
  const role = await getUserRole(userId);

  // Super admins have access to all colleges
  if (role === "super_admin") {
    return true;
  }

  // College admins can only access their own college
  if (role === "college_admin") {
    const supabase = await createClient();
    const { data: adminProfile } = await supabase
      .from("college_admin_profiles")
      .select("college_id")
      .eq("id", userId)
      .single();

    return adminProfile?.college_id === collegeId;
  }

  return false;
}
