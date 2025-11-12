import { createClient } from "@/lib/supabase/server";
import { fetchProfileByUserIdCore } from "./fetch.core";

/**
 * Server-side profile fetching
 * Use this in Server Components, API Routes, Server Actions
 */
export async function fetchProfileByUserId(userId: string) {
  const supabase = await createClient();
  return fetchProfileByUserIdCore(supabase, userId);
}
