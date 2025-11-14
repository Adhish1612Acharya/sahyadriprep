import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.VECTOR_STORE_SUPABASE_URL!,
    process.env.VECTOR_STORE_SUPABASE_PUBLISHABLE_KEY!
  );
}
