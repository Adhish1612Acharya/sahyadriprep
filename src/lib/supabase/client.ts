import { ENV } from "@/config/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    ENV.NEXT_PUBLIC_SUPABASE_URL!,
    ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
