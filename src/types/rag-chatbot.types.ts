export interface InterviewDocumentSource {
  id: string;
  title: string;
  student_name?: string;
  company?: string;
  batch?: string;
  similarity: number;
  excerpt?: string;
  document_url?: string;
  has_video_preview?: boolean;
}

export interface YouTubeVideoSource {
  id: string;
  title: string;
  video_url?: string;
  thumbnail_url?: string;
  company?: string;
  similarity: number;
  content_section?: string;
  excerpt?: string;
}

export interface YouTubeTimestampSource {
  id: string;
  video_title: string;
  video_url?: string;
  timestamp_url?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  duration_seconds?: number;
  company?: string;
  similarity: number;
  excerpt?: string;
}

export interface RAGSources {
  interview_documents: InterviewDocumentSource[];
  youtube_videos: YouTubeVideoSource[];
  youtube_timestamps: YouTubeTimestampSource[];
}

export interface RAGResponse {
  success: boolean;
  message: string;
  sources: RAGSources;
  metadata: {
    context_used: boolean;
    relevant_chunks_count: number;
    sources_breakdown: {
      interview_documents: number;
      youtube_videos: number;
      youtube_timestamps: number;
      total_unique_sources: number;
    };
    performance: {
      search_time_ms: number;
      response_time_ms: number;
      total_time_ms: number;
    };
  };
}
