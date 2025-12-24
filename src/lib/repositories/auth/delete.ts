import { createAdminClient } from "@/lib/supabase/admin";

export async function adminDeleteAuthUser(userId: string) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
