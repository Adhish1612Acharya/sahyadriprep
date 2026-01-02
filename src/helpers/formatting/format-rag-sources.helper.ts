import {
  FormattedInterviewSource,
  FormattedYouTubeTimestampSource,
  FormattedYouTubeVideoSource,
  RAGSource,
} from "./types";
import { ContentChunk } from "@/models";

export function formatRAGSourceAsInterview(
  ragSource: RAGSource
): FormattedInterviewSource {
  return {
    id: ragSource.id,
    title: ragSource.title || "Interview Experience",
    student_name: ragSource.student_name || "Anonymous",
    company: ragSource.company || "",
    batch: ragSource.batch || "Unknown",
    similarity: Math.round(ragSource.similarity * 1000) / 1000,
    excerpt: ragSource.excerpt || "",
    document_url: ragSource.document_url || "",
    has_video_preview: Boolean(ragSource.has_video_preview),
  };
}

export function formatRAGSourceAsYouTubeVideo(
  ragSource: RAGSource
): FormattedYouTubeVideoSource {
  return {
    id: ragSource.id,
    title: ragSource.title || "YouTube Video",
    video_url: ragSource.video_url || "",
    thumbnail_url: ragSource.thumbnail_url || "",
    company: ragSource.company || "",
    similarity: Math.round(ragSource.similarity * 1000) / 1000,
    content_section: ragSource.content_section || "description",
    excerpt: ragSource.excerpt || "",
  };
}

export function formatRAGSourceAsYouTubeTimestamp(
  ragSource: RAGSource
): FormattedYouTubeTimestampSource {
  return {
    id: ragSource.id,
    video_title: ragSource.title || "YouTube Timestamp",
    video_url: ragSource.video_url || "",
    timestamp_url: ragSource.timestamp_url || "",
    start_timestamp: ragSource.start_timestamp || "",
    end_timestamp: ragSource.end_timestamp || "",
    duration_seconds: ragSource.duration_seconds || 0,
    company: ragSource.company || "",
    similarity: Math.round(ragSource.similarity * 1000) / 1000,
    excerpt: ragSource.excerpt || "",
  };
}

/**
 * Format a chunk into a standardized source object
 */
export function formatChunkAsSource(chunk: any): RAGSource {
  const metadata = chunk.metadata || {};
  const contentType = chunk.content_type || "";

  // Common fields
  const baseSource: Partial<RAGSource> = {
    id:
      metadata.youtube_video_id || metadata.interview_experience_id || chunk.id,
    similarity: chunk.similarity || 0,
    excerpt:
      chunk.content?.substring(0, 200) +
      (chunk.content?.length > 200 ? "..." : ""),
  };

  // YouTube video source
  if (contentType.startsWith("youtube_video")) {
    return {
      ...baseSource,
      type: "youtube_video",
      title: metadata.video_title || "YouTube Video",
      video_url: metadata.video_url,
      content_section: metadata.content_section,
      company_id: metadata.company_id,
      college_id: metadata.college_id,

      // Transcript-specific fields
      ...(contentType === "youtube_video_transcript" && {
        timestamp_url: metadata.timestamp_url,
        start_timestamp: metadata.start_timestamp,
        end_timestamp: metadata.end_timestamp,
        duration_seconds: metadata.duration_seconds,
      }),
    } as RAGSource;
  }

  // Interview document source
  return {
    ...baseSource,
    type: "interview_document",
    title: metadata.document_title || "Interview Experience",
    student_name: metadata.student_name,
    batch: metadata.batch,
    company_id: metadata.company_id,
    college_id: metadata.college_id,
    document_url: metadata.document_media_id,
    has_video_preview: metadata.has_video_preview,
  } as RAGSource;
}

/**
 * Build context string from chunks for LLM
 */
export function buildContextFromChunks(chunks: ContentChunk[]): string {
  return chunks
    .map((chunk: any, index: number) => {
      const metadata = chunk.metadata || {};
      const contentType = chunk.content_type || "";

      // Format source header
      let sourceHeader = `[Source ${index + 1}`;

      if (contentType.startsWith("youtube_video")) {
        sourceHeader += `: YouTube - ${metadata.video_title || "Video"}`;
        if (contentType === "youtube_video_transcript") {
          sourceHeader += ` (${metadata.start_timestamp || "0:00"} - ${
            metadata.end_timestamp || "0:00"
          })`;
        } else {
          sourceHeader += ` (${metadata.content_section || "info"})`;
        }
      } else {
        sourceHeader += `: ${
          metadata.document_title ||
          metadata.student_name ||
          "Interview Experience"
        }`;
      }
      sourceHeader += `]`;

      // Build metadata section
      const metadataLines = [];

      if (metadata.company_name) {
        metadataLines.push(`Company: ${metadata.company_name}`);
      }

      if (metadata.student_name) {
        metadataLines.push(`Student: ${metadata.student_name}`);
      }

      if (metadata.batch) {
        metadataLines.push(`Batch: ${metadata.batch}`);
      }

      if (
        contentType === "youtube_video_transcript" &&
        metadata.start_timestamp
      ) {
        metadataLines.push(
          `Time Range: ${metadata.start_timestamp} - ${metadata.end_timestamp}`
        );
      }

      metadataLines.push(`Relevance: ${(chunk.similarity * 100).toFixed(1)}%`);

      // Combine everything
      return `${sourceHeader}
${metadataLines.join("\n")}

Summary:
${chunk.summary || "No summary available"}

Content:
${chunk.content || "No content available"}`;
    })
    .join("\n\n" + "=".repeat(80) + "\n\n");
}

/**
 * Group sources by type and deduplicate
 */
export function groupAndDeduplicateSources(sources: RAGSource[]): {
  interviewDocuments: RAGSource[];
  youtubeVideos: RAGSource[];
  youtubeTimestamps: RAGSource[];
} {
  const interviewDocuments: RAGSource[] = [];
  const youtubeVideos: RAGSource[] = [];
  const youtubeTimestamps: RAGSource[] = [];

  // Track seen IDs to avoid duplicates
  const seenInterviewDocs = new Set<string>();
  const seenYouTubeVideos = new Set<string>();

  for (const source of sources) {
    if (source.type === "interview_document") {
      if (!seenInterviewDocs.has(source.id)) {
        interviewDocuments.push(source);
        seenInterviewDocs.add(source.id);
      }
    } else if (source.type === "youtube_video") {
      // Transcript sources go to timestamps
      if (source.content_section === "transcript" && source.timestamp_url) {
        youtubeTimestamps.push(source);
      }
      // Video-level sources (title/description) go to videos
      else if (!seenYouTubeVideos.has(source.id)) {
        youtubeVideos.push(source);
        seenYouTubeVideos.add(source.id);
      }
    }
  }

  return {
    interviewDocuments,
    youtubeVideos,
    youtubeTimestamps,
  };
}
