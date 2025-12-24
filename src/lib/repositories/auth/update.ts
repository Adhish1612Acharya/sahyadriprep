import { createAdminClient } from "@/lib/supabase/admin";

export async function adminUpdateUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: metadata }
  );
  if (error) throw error;
  return data.user;
}
