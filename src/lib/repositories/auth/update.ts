import { createAdminClient } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";

export async function adminUpdateUserMetadata(
  userId: string,
  metadata: Record<string, any>
): Promise<{ data: User | null; error: any }> {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: metadata }
  );
  return { data: data.user, error };
}
