import {
  ChunkWithMetadata,
  TranscriptChunk,
  TranscriptData,
  TranscriptSegment,
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

export const fetchYouTubeTranscript = async (
  videoId: string
): Promise<TranscriptData | null> => {
  try {
    const { Innertube } = await import("youtubei.js");

    console.log("🔍 Retrieving transcript for video ID:", videoId);

    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);

    console.log("📹 Video info retrieved:", {
      title: info.basic_info.title,
      author: info.basic_info.author,
      duration: info.basic_info.duration,
    });

    // ✅ Check available caption tracks
    const captionTracks = info.captions?.caption_tracks || [];
    console.log(
      "📋 Available caption tracks:",
      captionTracks.map((track: any) => ({
        language: track.language_code,
        name: track.name?.text,
        is_translatable: track.is_translatable,
      }))
    );

    // ✅ Check if English captions exist
    const englishTrack = captionTracks.find(
      (track: any) =>
        track.language_code === "en" || track.language_code?.startsWith("en-")
    );

    if (!englishTrack) {
      console.error("❌ No native English transcript available");

      // 🔮 TODO: Future implementation with FastAPI
      // When English transcript is not available, call FastAPI endpoint
      // to get translated transcript using Python youtube-transcript-api
      //
      // Example:
      // const response = await fetch(`${FASTAPI_BASE_URL}/api/transcript/${videoId}`);
      // const data = await response.json();
      // return processTranscriptData(data);

      throw new Error(
        "English transcript not available. Translation service not yet implemented."
      );
    }

    console.log("✅ Found native English transcript track");
    const transcriptData: any = await info.getTranscript();

    // ✅ Process native English transcript
    console.log("📝 Processing transcript data...");

    let segments: any[] | undefined;

    if (transcriptData?.transcript?.content?.body?.initial_segments) {
      segments = transcriptData.transcript.content.body.initial_segments;
    } else if (transcriptData?.content?.body?.initial_segments) {
      segments = transcriptData.content.body.initial_segments;
    } else if (transcriptData?.actions) {
      segments = transcriptData.actions;
    } else if (Array.isArray(transcriptData)) {
      segments = transcriptData;
    } else if (transcriptData?.segments) {
      segments = transcriptData.segments;
    }

    if (!segments || segments.length === 0) {
      console.log("❌ No segments found");
      return null;
    }

    console.log(`📊 Found ${segments.length} transcript segments`);

    // Map segments
    const mappedSegments: TranscriptSegment[] = segments.map((item: any) => {
      const text = item.snippet?.text || item.text || "";
      const startMs = parseInt(item.start_ms || "0", 10);
      const endMs = parseInt(item.end_ms || "0", 10);

      return {
        text: text.trim(),
        start: startMs / 1000,
        duration: (endMs - startMs) / 1000,
      };
    });

    const validSegments = mappedSegments.filter((seg) => seg.text.length > 0);

    if (validSegments.length === 0) {
      console.log("❌ All segments are empty");
      return null;
    }

    const fullText = validSegments.map((s) => s.text).join(" ");

    // ✅ Check if text is actually English
    const isEnglish = /^[\x00-\x7F]*$/.test(fullText.slice(0, 100));
    if (!isEnglish) {
      console.warn("⚠️ Transcript appears to be non-English, skipping");
      return null;
    }

    const totalDuration =
      validSegments[validSegments.length - 1].start +
      validSegments[validSegments.length - 1].duration;

    console.log("✅ Transcript processed successfully:", {
      characters: fullText.length,
      segments: validSegments.length,
      duration: Math.round(totalDuration),
      firstSegment: fullText.slice(0, 50) + "...",
    });

    return {
      text: fullText,
      segments: validSegments,
      duration: Math.round(totalDuration),
      language: "en",
    };
  } catch (error: any) {
    console.error("❌ Error fetching transcript:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
    });
    return null;
  }
};

/**
 * Chunk transcript into smaller parts
 */
// export const chunkTranscriptByTime = (
//   segments: TranscriptSegment[],
//   chunkDurationMinutes: number = 5
// ): TranscriptChunk[] => {
//   const chunkDurationSeconds = chunkDurationMinutes * 60;
//   const chunks: TranscriptChunk[] = [];

//   let currentChunk: TranscriptSegment[] = [];
//   let chunkStartTime = 0;
//   let currentChunkDuration = 0;

//   for (const segment of segments) {
//     // If adding this segment exceeds chunk duration, save current chunk
//     if (
//       currentChunkDuration > 0 &&
//       segment.start - chunkStartTime >= chunkDurationSeconds
//     ) {
//       const lastSegment = currentChunk[currentChunk.length - 1];
//       chunks.push({
//         text: currentChunk.map((s) => s.text).join(" "),
//         start_time: chunkStartTime,
//         end_time: lastSegment.start + lastSegment.duration,
//         segment_count: currentChunk.length,
//       });

//       // Start new chunk
//       currentChunk = [];
//       chunkStartTime = segment.start;
//       currentChunkDuration = 0;
//     }

//     currentChunk.push(segment);
//     currentChunkDuration = segment.start - chunkStartTime + segment.duration;
//   }

//   // Add final chunk
//   if (currentChunk.length > 0) {
//     const lastSegment = currentChunk[currentChunk.length - 1];
//     chunks.push({
//       text: currentChunk.map((s) => s.text).join(" "),
//       start_time: chunkStartTime,
//       end_time: lastSegment.start + lastSegment.duration,
//       segment_count: currentChunk.length,
//     });
//   }

//   console.log(
//     `✅ Created ${chunks.length} chunks of ~${chunkDurationMinutes} minutes each`
//   );
//   return chunks;
// };

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

/**
 * Fetch video metadata from YouTube Data API v3
 */
export const fetchYouTubeMetadata = async (videoId: string) => {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    throw new Error("YouTube API key is not configured");
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${API_KEY}`;

  console.log("🎬 Fetching YouTube metadata for:", videoId);

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `YouTube API error: ${error.error?.message || "Failed to fetch video"}`
    );
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found or is private");
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const contentDetails = video.contentDetails;

  const durationInSeconds = parseYouTubeDuration(contentDetails.duration);

  console.log("✅ Metadata fetched:", {
    title: snippet.title,
    duration: durationInSeconds,
  });

  return {
    video_id: videoId,
    title: snippet.title,
    description: snippet.description,
    thumbnail_url:
      snippet.thumbnails.maxres?.url ||
      snippet.thumbnails.high?.url ||
      snippet.thumbnails.default?.url,
    duration: durationInSeconds,
    channel_id: snippet.channelId,
    published_at: snippet.publishedAt,
  };
};
