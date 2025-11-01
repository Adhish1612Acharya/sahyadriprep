export interface RAGSource {
  type: "interview_document" | "youtube_video";
  id: string;
  title: string;
  similarity: number;

  // Common fields
  company?: string;
  college?: string;

  // Interview document fields
  student_name?: string;
  batch?: string;
  document_url?: string;
  has_video_preview?: boolean;

  // YouTube video fields
  video_url?: string;
  timestamp_url?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  duration_seconds?: number;
  content_section?: "title" | "description" | "transcript";
  thumbnail_url?: string;

  // Content preview
  excerpt?: string;
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
      chunk.id || metadata.youtube_video_id || metadata.interview_experience_id,
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
      thumbnail_url: metadata.thumbnail_url,
      content_section: metadata.content_section,
      company: metadata.company_name,
      college: metadata.college_name,

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
    company: metadata.company_name,
    college: metadata.college_name,
    document_url: metadata.document_url,
    has_video_preview: metadata.has_video_preview,
  } as RAGSource;
}

/**
 * Build context string from chunks for LLM
 */
export function buildContextFromChunks(chunks: any[]): string {
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
  interview_documents: RAGSource[];
  youtube_videos: RAGSource[];
  youtube_timestamps: RAGSource[];
} {
  const interview_documents: RAGSource[] = [];
  const youtube_videos: RAGSource[] = [];
  const youtube_timestamps: RAGSource[] = [];

  // Track seen IDs to avoid duplicates
  const seenInterviewDocs = new Set<string>();
  const seenYouTubeVideos = new Set<string>();

  for (const source of sources) {
    if (source.type === "interview_document") {
      if (!seenInterviewDocs.has(source.id)) {
        interview_documents.push(source);
        seenInterviewDocs.add(source.id);
      }
    } else if (source.type === "youtube_video") {
      // Transcript sources go to timestamps
      if (source.content_section === "transcript" && source.timestamp_url) {
        youtube_timestamps.push(source);
      }
      // Video-level sources (title/description) go to videos
      else if (!seenYouTubeVideos.has(source.id)) {
        youtube_videos.push(source);
        seenYouTubeVideos.add(source.id);
      }
    }
  }

  return {
    interview_documents,
    youtube_videos,
    youtube_timestamps,
  };
}
