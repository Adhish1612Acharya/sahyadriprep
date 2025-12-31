import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getCurrentUser, getUserRoleFromProfile } from "./auth-session.service";
import { HttpError } from "@/lib/api/http";
import { fetchAuthProfileByUserId } from "../profiles";
import { AuthProfile } from "@/models";

export async function requireAuth(supabase: SupabaseClient): Promise<User> {
  const user = await getCurrentUser(supabase);
  if (!user) {
    throw new HttpError("Unauthorized", 401, "UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(
  supabase: SupabaseClient
): Promise<{ user: User; role: string; profile: AuthProfile }> {
  const user = await requireAuth(supabase);

  const profile = await fetchAuthProfileByUserId(supabase, user.id);

  const role = getUserRoleFromProfile(profile);

  if (!role || (role !== "college_admin" && role !== "super_admin")) {
    throw new HttpError(
      "Only college admins and super admins can perform this action",
      403,
      "FORBIDDEN",
      { role }
    );
  }

  return { user, role, profile };
}

export async function requireSuperAdmin(
  supabase: SupabaseClient
): Promise<{ user: User; role: string; profile: AuthProfile }> {
  const user = await requireAuth(supabase);

  const profile = await fetchAuthProfileByUserId(supabase, user.id);

  const role = getUserRoleFromProfile(profile);

  if (!role || role !== "super_admin") {
    throw new HttpError(
      "Only college admins and super admins can perform this action",
      403,
      "FORBIDDEN",
      { role }
    );
  }

  return { user, role, profile };
}
