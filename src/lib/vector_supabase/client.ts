import { ENV } from "@/config/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    ENV.VECTOR_STORE_SUPABASE_URL!,
    ENV.VECTOR_STORE_SUPABASE_PUBLISHABLE_KEY!
  );
}
