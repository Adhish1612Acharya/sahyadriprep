import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PASSWORD_REQUIREMENTS } from "@/constants/password_requirements";
import { PasswordValidationResult } from "@/types/helpers/auth";

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

/**
 * Get the allowed email domain/pattern for a college.
 * Expects `colleges` table to have `email_domain` (e.g. "sahyadri.edu.in")
 * Admin UI should let college admins set this value.
 */
export async function getCollegeEmailDomain(collegeId: string | null) {
  if (!collegeId) {
    // default to sahyadri for now
    return "sahyadri.edu.in";
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("colleges")
      .select("email_domain")
      .eq("id", collegeId)
      .single();

    if (error || !data) {
      console.warn("getCollegeEmailDomain: fallback used", { error });
      return "sahyadri.edu.in";
    }

    return data.email_domain || "sahyadri.edu.in";
  } catch (e) {
    console.warn("getCollegeEmailDomain error", e);
    return "sahyadri.edu.in";
  }
}

/**
 * Validate an email against the college domain.
 * Supports simple exact domain match. Can be extended to support multiple patterns.
 */
export async function isEmailAllowedForCollege(
  email: string,
  collegeId: string | null
) {
  const allowedDomain = await getCollegeEmailDomain(collegeId);
  const normalized = (email || "").toLowerCase().trim();
  return normalized.endsWith("@" + allowedDomain.toLowerCase());
}

/**
 * Helper to delete a Supabase auth user by id (server, service role)
 */
export async function deleteAuthUserById(userId: string) {
  try {
    const supabaseAdmin = createAdminClient(); // ✅ Use admin client

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    console.log(`✅ Successfully deleted user: ${userId}`);
    return { success: true };
  } catch (e: any) {
    console.error("❌ deleteAuthUserById error:", e);
    return { success: false, error: e };
  }
}

/**
 * Create a new auth user
 * Uses signUp() for email confirmation flow, admin.createUser() for auto-confirm
 *
 * @param email - User's email address
 * @param password - User's password
 * @param role - User role (student, college_admin, super_admin)
 * @param college_id - College ID (optional)
 * @param email_confirm - If true, auto-confirms email. If false, sends confirmation email
 * @returns User data or error
 */
export async function createAuthUser(params: {
  email: string;
  password: string;
  role: "student" | "college_admin" | "super_admin";
  college_id?: string | null;
  email_confirm?: boolean;
}) {
  const {
    email,
    password,
    role,
    college_id = null,
    email_confirm = false,
  } = params;

  try {
    console.log("Sign Up Params:", params);

    // ✅ CASE 1: Auto-confirm email (admin creation, no email sent)
    if (email_confirm === true) {
      const supabaseAdmin = createAdminClient();

      console.log(`📝 Creating auth user (auto-confirmed): ${email} (${role})`);

      const { data: userData, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            role,
            college_id: college_id || null,
          },
          email_confirm: true, // ✅ Auto-confirm, no email sent
        });

      if (createError) {
        console.error("❌ createAuthUser error:", createError);
        return { success: false, error: createError };
      }

      if (!userData.user) {
        return { success: false, error: { message: "Failed to create user" } };
      }

      console.log(`✅ Auth user created (confirmed): ${userData.user.id}`);

      return {
        success: true,
        user: userData.user,
      };
    }

    // ✅ CASE 2: Require email confirmation (sends confirmation email)
    const supabase = await createClient();

    console.log(
      `📝 Creating auth user (confirmation required): ${email} (${role})`
    );

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            role,
            college_id: college_id || null,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        },
      }
    );

    if (signUpError) {
      console.error("❌ signUp error:", signUpError);
      return { success: false, error: signUpError };
    }

    if (!signUpData.user) {
      return { success: false, error: { message: "Failed to create user" } };
    }

    console.log(
      `✅ Auth user created (pending confirmation): ${signUpData.user.id}`
    );
    console.log(`📧 Confirmation email sent to: ${email}`);

    return {
      success: true,
      user: signUpData.user,
    };
  } catch (e: any) {
    console.error("❌ Unexpected error in createAuthUser:", e);
    return { success: false, error: e };
  }
}

/**
 * Create a profile entry for a user
 * Should be called after creating the auth user
 *
 * @param userId - Auth user ID
 * @param role - User role
 * @param college_id - College ID (optional)
 * @returns Success status or error
 */
export async function createUserProfile(params: {
  userId: string;
  role: "student" | "college_admin" | "super_admin";
  profile_completed?: boolean;
}) {
  const { userId, role, profile_completed = false } = params;

  try {
    const supabase = await createClient();

    console.log(`📝 Creating profile for user: ${userId}`);

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role,
      profile_completed,
    });

    if (profileError) {
      console.error("❌ createUserProfile error:", profileError);
      return { success: false, error: profileError };
    }

    console.log(`✅ Profile created for user: ${userId}`);

    return { success: true };
  } catch (e: any) {
    console.error("❌ Unexpected error in createUserProfile:", e);
    return { success: false, error: e };
  }
}

/**
 * Complete signup flow: Create auth user + profile
 * Includes automatic rollback if profile creation fails
 *
 * @returns User data or error response
 */
export async function createUserWithProfile(params: {
  email: string;
  password: string;
  role: "student" | "college_admin" | "super_admin";
  college_id?: string | null;
  email_confirm?: boolean;
}) {
  const { email, password, role, college_id, email_confirm } = params;

  // Step 1: Create auth user
  const authResult = await createAuthUser({
    email,
    password,
    role,
    college_id,
    email_confirm,
  });

  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      error: authResult.error?.message || "Failed to create user",
    };
  }

  const userId = authResult.user.id;

  // Step 2: Create profile
  const profileResult = await createUserProfile({
    userId,
    role,
    profile_completed: false,
  });

  if (!profileResult.success) {
    // Rollback: Delete the auth user
    console.log("🔄 Rolling back auth user creation due to profile error");
    await deleteAuthUserById(userId);

    return {
      success: false,
      error: "Failed to create profile. Please try again.",
      details: profileResult.error?.message,
    };
  }

  // Step 3: Return success
  return {
    success: true,
    user: {
      id: userId,
      email: authResult.user.email,
      role,
      profile_completed: false,
    },
  };
}

/**
 * Optional helper used in routes: returns NextResponse if invalid else null.
 */
export async function enforceCollegeEmailOrReject(
  email: string,
  collegeId: string | null
) {
  const ok = await isEmailAllowedForCollege(email, collegeId);
  if (!ok) {
    return NextResponse.json(
      {
        success: false,
        error: "InvalidEmailDomain",
        message: "Please sign up with your college email",
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Update user metadata (cached profile data)
 * This updates the auth.users table user_metadata field
 * Used to cache profile data and avoid DB queries in middleware
 *
 * @param userId - Auth user ID
 * @param metadata - Metadata to update
 * @returns Success status or error
 */
export async function updateUserMetadata(
  userId: string,
  metadata: {
    role: "student" | "college_admin" | "super_admin";
    college_id?: string | null;
    profile_completed: boolean;
    [key: string]: any; // Allow additional fields
  }
) {
  try {
    const supabaseAdmin = createAdminClient();

    console.log(`📝 Updating user metadata for: ${userId}`, metadata);

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: metadata,
      }
    );

    if (error) {
      console.error("❌ updateUserMetadata error:", error);
      return { success: false, error };
    }

    console.log(`✅ User metadata updated: ${userId}`);

    return {
      success: true,
      user: data.user,
    };
  } catch (e: any) {
    console.error("❌ Unexpected error in updateUserMetadata:", e);
    return { success: false, error: e };
  }
}

/**
 * Sync profile data to user metadata (cache)
 * Fetches profile from DB and updates auth user metadata
 * Call this after updating profile in DB
 *
 * @param userId - Auth user ID
 * @returns Success status or error
 */
export async function syncProfileToMetadata(
  userId: string
): Promise<{ success: boolean; error?: any; profile?: any }> {
  try {
    const supabase = await createClient();

    console.log(`🔄 Syncing profile to metadata for: ${userId}`);

    // Fetch current profile from DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, profile_completed")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ Failed to fetch profile:", profileError);
      return { success: false, error: profileError };
    }

    // Update user metadata with profile data
    const result = await updateUserMetadata(userId, {
      role: profile.role,
      profile_completed: profile.profile_completed,
    });

    if (!result.success) {
      return result;
    }

    console.log(`✅ Profile synced to metadata: ${userId}`);

    return { success: true, profile };
  } catch (e: any) {
    console.error("❌ Unexpected error in syncProfileToMetadata:", e);
    return { success: false, error: e };
  }
}

export function validatePassword(password: string): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasLowercase: PASSWORD_REQUIREMENTS.regex.lowercase.test(password),
    hasUppercase: PASSWORD_REQUIREMENTS.regex.uppercase.test(password),
    hasDigit: PASSWORD_REQUIREMENTS.regex.digit.test(password),
    hasSymbol: PASSWORD_REQUIREMENTS.regex.symbol.test(password),
  };

  const errors: string[] = [];

  if (!requirements.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
    );
  }
  if (!requirements.hasLowercase) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }
  if (!requirements.hasUppercase) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }
  if (!requirements.hasDigit) {
    errors.push("Password must contain at least one digit (0-9)");
  }
  if (!requirements.hasSymbol) {
    errors.push("Password must contain at least one symbol (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
  };
}
