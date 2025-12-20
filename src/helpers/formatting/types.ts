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