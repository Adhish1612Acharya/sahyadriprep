export interface InterviewDocumentSource {
  id: string;
  title: string;
  student_name: string;
  batch: string;
  company?: string;
  similarity: number;
  excerpt: string;
  has_video_preview: boolean;
  document_url: string;
}

export interface YouTubeVideoSource {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  company?: string;
  similarity: number;
  excerpt: string;
  content_section: "title" | "description" | "transcript";
}

export interface YouTubeTimestampSource {
  id: string;
  video_title: string;
  video_url: string;
  timestamp_url: string;
  start_timestamp: string;
  end_timestamp: string;
  duration_seconds: number;
  company?: string;
  similarity: number;
  excerpt: string;
}

export interface SourcesDisplay {
  interview_documents: InterviewDocumentSource[];
  youtube_videos: YouTubeVideoSource[];
  youtube_timestamps: YouTubeTimestampSource[];
}
