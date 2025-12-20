import type { SupabaseClient } from "@supabase/supabase-js";
import {
  insertUserProfile,
  type UserRole,
} from "@/lib/repositories/auth/auth.repository";
import {
  adminCreateAuthUser,
  adminDeleteAuthUser,
} from "@/lib/repositories/auth/authAdmin.repository";
import { ENV } from "@/config/env";

export async function createAuthUser(
  supabase: SupabaseClient,
  params: {
    email: string;
    password: string;
    role: UserRole;
    college_id?: string | null;
    email_confirm?: boolean;
    redirectUrl?: string;
  }
) {
  const {
    email,
    password,
    role,
    college_id,
    email_confirm = false,
    redirectUrl,
  } = params;

  // CASE 1: auto-confirm (admin create) – still uses admin client internally
  if (email_confirm === true) {
    try {
      const user = await adminCreateAuthUser({
        email,
        password,
        role,
        college_id,
      });
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error };
    }
  }

  // CASE 2: email confirmation required – use the passed-in request client
  try {
    const confirmUrl = redirectUrl
      ? `${
          ENV.NEXT_PUBLIC_SITE_URL
        }/auth/confirm?redirect=${encodeURIComponent(redirectUrl)}`
      : `${ENV.NEXT_PUBLIC_SITE_URL}/auth/confirm`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          college_id: college_id ?? null,
        },
        emailRedirectTo: confirmUrl,
      },
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error ?? { message: "Failed to create user" },
      };
    }

    return { success: true, user: data.user };
  } catch (e: any) {
    return { success: false, error: e };
  }
}

export async function createUserProfile(
  supabase: SupabaseClient,
  params: {
    userId: string;
    email: string;
    role: UserRole;
    profile_completed?: boolean;
  }
) {
  const { userId, email, role, profile_completed = false } = params;

  try {
    await insertUserProfile(supabase, {
      userId,
      email,
      role,
      profile_completed,
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e };
  }
}

export async function deleteAuthUserById(userId: string) {
  try {
    await adminDeleteAuthUser(userId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e };
  }
}

export async function createUserWithProfile(
  supabase: SupabaseClient,
  params: {
    email: string;
    password: string;
    role: UserRole;
    college_id?: string | null;
    email_confirm?: boolean;
    redirectUrl?: string;
  }
) {
  const authResult = await createAuthUser(supabase, params);

  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      error: authResult.error?.message || "Failed to create user",
    };
  }

  const userId = authResult.user.id;

  const profileResult = await createUserProfile(supabase, {
    userId,
    email: authResult.user.email!,
    role: params.role,
    profile_completed: false,
  });

  if (!profileResult.success) {
    await deleteAuthUserById(userId);
    return {
      success: false,
      error: "Failed to create profile. Please try again.",
      details: profileResult.error?.message,
    };
  }

  return {
    success: true,
    user: {
      id: userId,
      email: authResult.user.email,
      role: params.role,
      profile_completed: false,
    },
  };
}
