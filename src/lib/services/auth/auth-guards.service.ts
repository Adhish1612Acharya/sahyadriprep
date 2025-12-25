import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCurrentUser,
  getUserRole,
  getUserRoleFromProfile,
} from "./auth-session.service";
import { AuthProfile } from "@/models";
import { fetchProfileByUserId } from "@/lib/repositories/profiles";

export async function requireAuth(supabase: SupabaseClient) {
  const user = await getCurrentUser(supabase);
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

export async function requireAdmin(supabase: SupabaseClient) {
  const { error, user } = await requireAuth(supabase);
  if (error || !user) {
    return {
      error,
      user: null,
      role: null,
      profile: null as AuthProfile | null,
    };
  }

  const profile = await fetchProfileByUserId(supabase, user.id);

  if (!profile) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 404 }
      ),
      user: null,
      role: null,
      profile: null,
    };
  }

  const role = getUserRoleFromProfile(profile);

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
      profile: null,
    };
  }

  return { error: null, user, role, profile };
}

export async function requireSuperAdmin(supabase: SupabaseClient) {
  const { error, user } = await requireAuth(supabase);
  if (error || !user) {
    return {
      error,
      user: null,
      role: null,
      profile: null as AuthProfile | null,
    };
  }

  const profile = await fetchProfileByUserId(supabase, user.id);

  if (!profile) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 404 }
      ),
      user: null,
      role: null,
      profile: null,
    };
  }

  const role = getUserRoleFromProfile(profile);

  if (!role || role !== "super_admin") {
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
      profile: null,
    };
  }

  return { error: null, user, role, profile };
}
