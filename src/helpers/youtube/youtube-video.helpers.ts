import { TranscriptSegment } from "@/features/youtube/types";
import {
  ChunkWithMetadata,
} from "@/types/youtube-videos.types";

/**
 * Parse YouTube ISO 8601 duration to seconds
 */
export const parseYouTubeDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Format duration from seconds to readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Chunk transcript by token count for better semantic coherence
 * @param segments - Array of transcript segments
 * @param targetWords - Target word count per chunk (default: 200)
 * @param maxWords - Maximum word count per chunk (default: 300)
 * @returns Array of chunked transcript segments with metadata
 */
export function chunkTranscriptByTokens(
  segments: TranscriptSegment[],
  targetWords: number = 200,
  maxWords: number = 300
): ChunkWithMetadata[] {
  const chunks: ChunkWithMetadata[] = [];
  let currentChunk: TranscriptSegment[] = [];
  let currentWordCount = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const segmentWords = segment.text
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    // ✅ Decision logic:
    // - If we've reached targetWords AND adding next segment exceeds maxWords, finalize chunk
    // - If we've exceeded maxWords, always finalize chunk
    const shouldFinalizeChunk =
      currentChunk.length > 0 &&
      ((currentWordCount >= targetWords &&
        currentWordCount + segmentWords > maxWords) ||
        currentWordCount + segmentWords > maxWords);

    if (shouldFinalizeChunk) {
      chunks.push(createChunkFromSegments(currentChunk, chunks.length));
      currentChunk = [segment];
      currentWordCount = segmentWords;
    } else {
      currentChunk.push(segment);
      currentWordCount += segmentWords;
    }
  }

  // Add remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(createChunkFromSegments(currentChunk, chunks.length));
  }

  console.log(
    `✅ Created ${chunks.length} chunks with target=${targetWords}, max=${maxWords} words`
  );
  console.log(`📊 Chunk sizes: ${chunks.map((c) => c.word_count).join(", ")}`);

  return chunks;
}

/**
 * Create a chunk object from an array of segments
 */
function createChunkFromSegments(
  segments: TranscriptSegment[],
  chunkIndex: number
): ChunkWithMetadata {
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Combine all segment texts
  const combinedText = segments
    .map((s) => s.text)
    .join(" ")
    .trim();

  // Calculate word count
  const wordCount = combinedText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return {
    text: combinedText,
    start_time: firstSegment.start,
    end_time: lastSegment.start + lastSegment.duration,
    segment_start: firstSegment.index || 0,
    segment_end: lastSegment.index || segments.length - 1,
    segment_count: segments.length,
    word_count: wordCount,
    chunk_index: chunkIndex,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract YouTube video ID from URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);

    // Format 1: youtube.com/watch?v=VIDEO_ID
    if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname === "/watch"
    ) {
      return urlObj.searchParams.get("v");
    }

    // Format 2: youtu.be/VIDEO_ID
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }

    // Format 3: youtube.com/embed/VIDEO_ID
    if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname.startsWith("/embed/")
    ) {
      return urlObj.pathname.split("/")[2];
    }

    return null;
  } catch (error) {
    return null;
  }
};
