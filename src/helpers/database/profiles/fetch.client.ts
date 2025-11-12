import { createClient } from "@/lib/supabase/client";
import { fetchProfileByUserIdCore } from "./fetch.core";

/**
 * Client-side profile fetching
 * Use this in Client Components, React hooks, contexts
 */
export function fetchProfileByUserId(userId: string) {
  const supabase = createClient();
  return fetchProfileByUserIdCore(supabase, userId);
}
