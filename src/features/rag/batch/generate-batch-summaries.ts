import { createChunkSummary } from "@/features/rag/generate-chunk-summary";
import { createFallbackSummary } from "../../../helpers/text/summaries";
import { BatchSummaryOptions } from "../types";

/**
 * Generate summaries for chunks in controlled batches to respect rate limits
 *
 * @param chunks - Array of text chunks to summarize
 * @param options - Batch processing configuration
 * @returns Array of summaries
 */
export async function generateSummariesInBatches(
  chunks: string[],
  options: BatchSummaryOptions = {}
): Promise<string[]> {
  const {
    batchSize = 5,
    delayBetweenBatches = 7000, // 7 seconds
    delayBetweenRequests = 500, // 0.5 seconds
    maxRetries = 2,
  } = options;

  const summaries: string[] = [];
  const totalChunks = chunks.length;
  const totalBatches = Math.ceil(totalChunks / batchSize);

  console.log(`📦 Processing ${totalChunks} chunks in ${totalBatches} batches`);
  console.log(`   Batch size: ${batchSize}`);
  console.log(`   Delay between batches: ${delayBetweenBatches}ms`);
  console.log(`   Delay between requests: ${delayBetweenRequests}ms`);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, totalChunks);
    const batchChunks = chunks.slice(batchStart, batchEnd);

    console.log(
      `\n📦 Batch ${batchIndex + 1}/${totalBatches}: Processing chunks ${
        batchStart + 1
      }-${batchEnd}`
    );

    // Process chunks in current batch sequentially
    for (let i = 0; i < batchChunks.length; i++) {
      const globalIndex = batchStart + i;
      const chunk = batchChunks[i];

      let summary = "";
      let attempt = 0;

      // ✅ Retry logic for each chunk
      while (attempt <= maxRetries) {
        try {
          console.log(
            `   [${
              globalIndex + 1
            }/${totalChunks}] Generating summary... (attempt ${attempt + 1}/${
              maxRetries + 1
            })`
          );

          // ✅ Call the simplified createChunkSummary (no internal retries)
          summary = await createChunkSummary(chunk);

          console.log(
            `   ✅ [${globalIndex + 1}/${totalChunks}] Summary generated (${
              summary.length
            } chars)`
          );
          break; // Success, exit retry loop
        } catch (error: any) {
          attempt++;

          const isRateLimitError =
            error?.message?.includes("429") ||
            error?.message?.includes("quota") ||
            error?.message?.includes("rate limit") ||
            error?.message?.includes("Too Many Requests");

          if (isRateLimitError) {
            // Extract retry delay from error message
            const retryMatch = error.message.match(/retry in ([\d.]+)s/);
            const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : 60;
            const retryMs = Math.min(retrySeconds * 1000, 60000); // Max 60 seconds

            if (attempt <= maxRetries) {
              console.warn(
                `   ⚠️ [${
                  globalIndex + 1
                }/${totalChunks}] Rate limit hit. Waiting ${Math.round(
                  retryMs / 1000
                )}s... (attempt ${attempt}/${maxRetries + 1})`
              );
              await new Promise((r) => setTimeout(r, retryMs));
            } else {
              // Max retries exceeded, use fallback
              console.error(
                `   ❌ [${
                  globalIndex + 1
                }/${totalChunks}] Rate limit exceeded after ${
                  maxRetries + 1
                } attempts. Using fallback.`
              );
              summary = createFallbackSummary(chunk);
              console.warn(
                `   ⚠️ [${
                  globalIndex + 1
                }/${totalChunks}] Fallback summary created (${
                  summary.length
                } chars)`
              );
              break;
            }
          } else {
            // Non-rate-limit error
            if (attempt <= maxRetries) {
              console.warn(
                `   ⚠️ [${globalIndex + 1}/${totalChunks}] Error: ${
                  error.message
                }. Retrying in 2s... (attempt ${attempt}/${maxRetries + 1})`
              );
              await new Promise((r) => setTimeout(r, 2000));
            } else {
              // Max retries exceeded, use fallback
              console.error(
                `   ❌ [${globalIndex + 1}/${totalChunks}] Failed after ${
                  maxRetries + 1
                } attempts: ${error.message}. Using fallback.`
              );
              summary = createFallbackSummary(chunk);
              console.warn(
                `   ⚠️ [${
                  globalIndex + 1
                }/${totalChunks}] Fallback summary created (${
                  summary.length
                } chars)`
              );
              break;
            }
          }
        }
      }

      summaries.push(summary);

      // Delay between requests within batch (except last item)
      if (i < batchChunks.length - 1) {
        await new Promise((r) => setTimeout(r, delayBetweenRequests));
      }
    }

    // Delay between batches (except last batch)
    if (batchIndex < totalBatches - 1) {
      console.log(
        `\n⏳ Waiting ${delayBetweenBatches / 1000}s before next batch...`
      );
      await new Promise((r) => setTimeout(r, delayBetweenBatches));
    }
  }

  console.log(`\n✅ All ${summaries.length} summaries generated successfully`);

  // Log statistics
  const fallbackCount = summaries.filter(
    (s) => s.endsWith("…") || s.length === 300
  ).length;
  if (fallbackCount > 0) {
    console.warn(`⚠️ ${fallbackCount} summaries used fallback method`);
  }

  return summaries;
}
