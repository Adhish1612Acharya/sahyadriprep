"use server";

import { syncProfileToMetadata } from "@/helpers/auth.helpers";
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

  // ✅ Sync profile to metadata cache after successful login
  if (data.user) {
    const syncResult = await syncProfileToMetadata(data.user.id);

    if (!syncResult.success) {
      console.warn(
        "⚠️ Failed to sync profile to metadata on login:",
        syncResult.error
      );
      // Don't fail the login, metadata will sync on next request
    } else {
      console.log(`✅ Profile metadata synced on login: ${data.user.id}`);
    }
  }

  revalidatePath("/", "layout");
  return { success: true, data };
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
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
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
  } else {
    console.log(`✅ Profile metadata synced on login: ${user.id}`);
  }

  revalidatePath("/", "layout");
  return { success: true };
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
  } else {
    console.log(`✅ Profile metadata synced on login: ${user.id}`);
  }

  revalidatePath("/", "layout");
  return { success: true };
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      console.error("❌ Password reset email error:", error);
      return { error: error.message };
    }

    console.log("✅ Password reset email sent to:", email);
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

    console.log("✅ Password updated for user:", user.id);
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

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("❌ Password reset error:", error);
      return { error: error.message };
    }

    console.log("✅ Password reset successfully");

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Unexpected error in resetPasswordWithToken:", error);
    return { error: error.message || "Failed to reset password" };
  }
}

/**
 * Verify if user has valid reset token
 */
export async function verifyResetToken() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { valid: false, error: "Invalid or expired reset link" };
    }

    // Check if this is a password recovery session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { valid: false, error: "No active session" };
    }

    return { valid: true, user };
  } catch (error: any) {
    console.error("❌ Error verifying reset token:", error);
    return { valid: false, error: error.message };
  }
}
