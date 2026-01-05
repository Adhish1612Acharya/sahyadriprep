import { SupabaseClient } from "@supabase/supabase-js";
import { VectorSearchParams } from "./types";
import { ContentChunk } from "@/models";
import { supabaseRpcConstants } from "@/constants";

export async function searchVectorContent(
  supabase: SupabaseClient,
  params: VectorSearchParams
): Promise<{ data: ContentChunk[] | null; error: any }> {
  const { data, error } = await supabase.rpc(
    supabaseRpcConstants.MATCH_CONTENT_FUNCTION,
    {
      query_embedding: params.queryEmbedding,
      match_threshold: params.matchThreshold || 0.5,
      match_count: params.matchCount || 10,
      filter_content_type: params.filterContentType || null,
      filter_company_ids:
        params.filterCompanyIds && params.filterCompanyIds.length > 0
          ? params.filterCompanyIds
          : null,
    }
  );

  return { data, error };
}
