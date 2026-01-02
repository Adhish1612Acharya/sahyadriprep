import type { SupabaseClient } from "@supabase/supabase-js";
import { createChunkSummarySafe } from "@/features/rag/generate-chunk-summary";
import { processCompanyFilter } from "@/features/ai-query-understanding";
import { QueryPreprocessResult } from "./types";

export async function preprocessRAGQuery(
  supabase: SupabaseClient,
  message: string
): Promise<QueryPreprocessResult> {
  // Step 1: Company filter using AI query understanding
  const companyIds = await processCompanyFilter(supabase, message);
  console.log("🏢 Companies found:", companyIds.length);

  // Step 2: Query summary (safe fallback)
  const querySummary = await createChunkSummarySafe(message);
  console.log("📝 Query summary:", querySummary.slice(0, 100) + "...");

  return { companyIds, querySummary };
}
