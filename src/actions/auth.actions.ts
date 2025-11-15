"use server";

import { syncProfileToMetadata } from "@/helpers/auth/auth.helpers";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Sign in with email and password
 * Syncs profile to metadata after successful login
 */
export async function signInWithEmail(formData: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  let syncResult;

  // ✅ Sync profile to metadata cache after successful login
  if (data.user) {
    syncResult = await syncProfileToMetadata(data.user.id);

    if (!syncResult.success) {
      console.warn(
        "⚠️ Failed to sync profile to metadata on login:",
        syncResult.error
      );
      // Don't fail the login, metadata will sync on next request
    }
  }

  // ✅ Redirect based on role
  const redirectMap = {
    student: "/",
    college_admin: "/admin/dashboard",
    super_admin: "/admin/dashboard",
  };

  const profile = syncResult?.profile;

  const redirectTo =
    redirectMap[profile.role as keyof typeof redirectMap] || "/";
  //redirect(redirectTo); // ✅ Server-side redirect

  // Return the path instead of redirecting
  return { success: true, redirectTo };
}

export async function signInWithGoogle(options?: {
  role?: "student" | "college_admin";
  college_id?: string | null;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // Pass role and college_id as query params (will be in user_metadata after auth)
      queryParams: {
        role: options?.role || "student",
        college_id: options?.college_id || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("❌ Sign out error:", error);
    return { error: error.message };
  }


  // revalidatePath("/", "layout");
  return { success: true };
}

export async function completeStudentProfile(formData: {
  full_name: string;
  phone?: string;
  college_id: string;
  usn: string;
  batch: string;
  branch: string;
  current_semester?: number;
  current_cgpa?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Insert into student_profiles - id is same as user.id
  const { error: profileError } = await supabase
    .from("student_profiles")
    .insert({
      id: user.id, // ✅ Use user.id directly
      full_name: formData.full_name,
      email: user.email!,
      phone: formData.phone,
      college_id: formData.college_id,
      usn: formData.usn,
      batch: formData.batch,
      branch: formData.branch,
      current_semester: formData.current_semester,
      current_cgpa: formData.current_cgpa,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Mark profile as completed
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ profile_completed: true })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const syncResult = await syncProfileToMetadata(user.id);

  if (!syncResult.success) {
    console.warn(
      "⚠️ Failed to sync profile to metadata on login:",
      syncResult.error
    );
    // Don't fail the login, metadata will sync on next request
  }

  revalidatePath("/", "layout");

  // ✅ Server-side redirect after profile completion
  redirect("/interview-experiences"); // Student dashboard
}

export async function completeAdminProfile(formData: {
  full_name: string;
  phone?: string;
  college_id: string;
  designation: string;
  department?: string;
  employee_id?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Insert into college_admin_profiles - id is same as user.id
  const { error: profileError } = await supabase
    .from("college_admin_profiles")
    .insert({
      id: user.id, // ✅ Use user.id directly
      full_name: formData.full_name,
      email: user.email!,
      phone: formData.phone,
      college_id: formData.college_id,
      designation: formData.designation,
      department: formData.department,
      employee_id: formData.employee_id,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Mark profile as completed
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ profile_completed: true })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const syncResult = await syncProfileToMetadata(user.id);

  if (!syncResult.success) {
    console.warn(
      "⚠️ Failed to sync profile to metadata on login:",
      syncResult.error
    );
    // Don't fail the login, metadata will sync on next request
  } 

  revalidatePath("/", "layout");

  // ✅ Server-side redirect after profile completion
  redirect("/admin/dashboard"); // Admin dashboard
}

export async function checkProfileCompletion() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isComplete: false, redirectTo: "/auth/login" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, profile_completed")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { isComplete: false, redirectTo: "/auth/complete-profile" };
  }

  if (!profile.profile_completed) {
    return { isComplete: false, redirectTo: "/auth/complete-profile" };
  }

  const redirectMap = {
    student: "/",
    college_admin: "/",
    super_admin: "/",
  };

  return {
    isComplete: true,
    redirectTo:
      redirectMap[profile.role as keyof typeof redirectMap] || "/dashboard",
  };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    const supabase = await createClient();

    // Use your token exchange URL (step 1 from PKCE flow)
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("❌ Password reset email error:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("❌ Unexpected error in sendPasswordResetEmail:", error);
    return { error: error.message || "Failed to send reset email" };
  }
}

/**
 * Update password (for logged-in users)
 */
export async function updatePassword(newPassword: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("❌ Password update error:", error);
      return { error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    console.error("❌ Unexpected error in updatePassword:", error);
    return { error: error.message || "Failed to update password" };
  }
}

/**
 * Reset password with token (from email link)
 */
export async function resetPasswordWithToken(
  newPassword: string,
  confirmPassword: string
) {
  try {
    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    if (newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }

    const supabase = await createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      return { error: updateError.message };
    }

    const {  error } = await signOut();

    if (error) {
      return { error: error };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Unexpected error in resetPasswordWithToken:", error);
    return { error: error.message || "Failed to reset password" };
  }
}


export async function verifyResetToken(token: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  return !error;
}

/**
 * Confirm email with token_hash from confirmation link (PKCE flow)
 */
export async function confirmEmail(tokenHash: string, type: string) {
  try {
    if (!tokenHash) {
      return { error: "Missing confirmation token" };
    }

    if (type !== "email" && type !== "signup" && type !== "recovery") {
      return { error: "Invalid confirmation type" };
    }

    const supabase = await createClient();

    // ✅ Exchange token_hash for session (PKCE flow)
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      console.error("❌ Email confirmation error:", error);
      return {
        error: error.message || "Invalid or expired confirmation link",
      };
    }

    if (!data.user) {
      return { error: "Failed to verify user after confirmation" };
    }

    // Sync profile metadata after email confirmation
    const syncResult = await syncProfileToMetadata(data.user.id);
    if (!syncResult.success) {
      console.warn(
        "⚠️ Failed to sync profile metadata after email confirmation"
      );
    }

    revalidatePath("/", "layout");
    return { success: true, user: data.user };
  } catch (error: any) {
    console.error("❌ Unexpected error in confirmEmail:", error);
    return { error: error.message || "Failed to confirm email" };
  }
}

/**
 * Exchange PKCE code for session (password reset flow)
 */
export async function exchangeCodeForSession(code: string) {
  try {
    if (!code) {
      return { valid: false, error: "Missing confirmation code" };
    }

    const supabase = await createClient();

    // ✅ Exchange PKCE code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("❌ Code exchange failed:", error);
      return {
        valid: false,
        error: error.message || "Invalid or expired reset link",
      };
    }

    if (!data.session || !data.user) {
      return {
        valid: false,
        error: "Failed to create session from code",
      };
    }

    revalidatePath("/", "layout");
    return { valid: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error("❌ Error exchanging code for session:", error);
    return { valid: false, error: error.message };
  }
}

/**
 * Verify token (handles both PKCE code and token_hash)
 * Used for email confirmation and password reset flows
 */
export async function verifyAuthToken(params: {
  code?: string;
  tokenHash?: string;
  type?: string;
}) {
  try {
    const { code, tokenHash, type } = params;

    // ✅ Case 1: PKCE code (modern flow - password reset)
    if (code) {
      return await exchangeCodeForSession(code);
    }

    // ✅ Case 2: token_hash (email confirmation, older flows)
    if (tokenHash && type) {
      return await verifyConfirmationToken(tokenHash, type);
    }

    return { valid: false, error: "Missing authentication token" };
  } catch (error: any) {
    console.error("❌ Error verifying auth token:", error);
    return { valid: false, error: error.message };
  }
}

/**
 * Verify if email confirmation token is valid
 */
export async function verifyConfirmationToken(tokenHash: string, type: string) {
  try {
    if (!tokenHash) {
      return { valid: false, error: "Missing confirmation token" };
    }

    const supabase = await createClient();

    // ✅ Map the type to valid Supabase OTP types
    let otpType: "signup" | "email" | "recovery" | "invite" | "magiclink";

    switch (type) {
      case "signup":
        otpType = "signup";
        break;
      case "email":
        otpType = "email";
        break;
      case "recovery":
        otpType = "recovery";
        break;
      case "invite":
        otpType = "invite";
        break;
      case "magiclink":
        otpType = "magiclink";
        break;
      default:
        return {
          valid: false,
          error: `Invalid verification type: ${type}`,
        };
    }

    // ✅ Verify the token_hash is valid
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });

    if (error || !data.user) {
      console.error("❌ Token verification failed:", error);
      return {
        valid: false,
        error: error?.message || "Invalid or expired confirmation link",
      };
    }

    // Sync profile metadata after verification
    const syncResult = await syncProfileToMetadata(data.user.id);
    if (!syncResult.success) {
      console.warn(
        "⚠️ Failed to sync profile metadata after token verification"
      );
    }

    revalidatePath("/", "layout");
    return { valid: true, user: data.user };
  } catch (error: any) {
    console.error("❌ Error verifying confirmation token:", error);
    return { valid: false, error: error.message };
  }
}
