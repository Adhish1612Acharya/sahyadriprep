import {
  buildContextFromChunks,
  formatChunkAsSource,
} from "@/helpers/formatting";
import { groupAndDeduplicateSources } from "@/helpers/formatting";
import { ContentChunk } from "@/models";
import { GroupedSources } from "./types";

export function buildRAGContextAndSources(relevantChunks: ContentChunk[]): {
  context: string;
  groupedSources: GroupedSources;
} {
  console.log("📚 Building context and sources...");

  const context = buildContextFromChunks(relevantChunks);
  const sources = relevantChunks.map(formatChunkAsSource);
  const groupedSources = groupAndDeduplicateSources(sources);

  return { context, groupedSources };
}
