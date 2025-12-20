import { ENV } from "@/config/env";
import { createClient } from "@supabase/supabase-js"; // ✅ Admin client

/**
 * ⚠️ ADMIN CLIENT - Full database access
 * Only use for admin operations (delete users, bypass RLS, etc.)
 * NEVER expose to client
 */
export function createAdminClient() {
  const supabaseUrl = ENV.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = ENV.SUPABASE_SERVICE_ROLE_KEY; // ✅ Service role key

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
