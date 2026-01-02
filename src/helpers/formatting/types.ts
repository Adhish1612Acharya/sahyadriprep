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

export interface FormattedInterviewSource {
  id: string;
  title: string;
  student_name: string;
  company: string;
  batch: string;
  similarity: number;
  excerpt: string;
  document_url: string;
  has_video_preview: boolean;
}

export interface FormattedYouTubeVideoSource {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  company: string;
  similarity: number;
  content_section: string;
  excerpt: string;
}

export interface FormattedYouTubeTimestampSource {
  id: string;
  video_title: string;
  video_url: string;
  timestamp_url: string;
  start_timestamp: string;
  end_timestamp: string;
  duration_seconds: number;
  company: string;
  similarity: number;
  excerpt: string;
}
