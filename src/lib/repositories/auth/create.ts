import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types/common.types";

export async function adminCreateAuthUser(params: {
  email: string;
  password: string;
  role: UserRole;
  college_id?: string | null;
}) {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    user_metadata: {
      role: params.role,
      college_id: params.college_id ?? null,
    },
    email_confirm: true,
  });

  if (error || !data.user) throw error ?? new Error("Failed to create user");
  return data.user;
}
