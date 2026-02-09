/**
 * AI Process Metadata stored in youtube_videos.ai_process_metadata (JSONB)
 */
export interface AIProcessMetadata {
  last_processed_at: string;
  processing_time_ms: number;
  ai_model: string;
  keys_used: {
    overview: boolean;
    segments: boolean;
    flashcards: boolean;
    tips: boolean;
  };
  counts: {
    segments: number;
    flashcards: number;
    tips: number;
  };
}

/**
 * YouTube video metadata
 */
export interface YouTubeVideo {
  id: string;
  video_id: string;
  video_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  company_id: string;
  college_id: string;
  created_at: string;
  updated_at: string;
  companies?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  colleges?: {
    id: string;
    name: string;
  };
  ai_process_done: boolean;
  ai_process_count: number;
  ai_process_metadata: AIProcessMetadata | null;
}

/**
 * Create YouTube video input
 */
export interface CreateYouTubeVideoInput {
  video_url: string;
  company_id: string;
  college_id: string;
}

/**
 * YouTube API response
 */
export interface YouTubeAPIResponse {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: number;
  channel_id: string;
  published_at: string;
}

// ============================================
// AI PROCESSING TYPES
// ============================================

/**
 * Process video input
 */
export interface ProcessVideoInput {
  video_id: string;
  title: string;
  description?: string;
}

/**
 * Transcript segment with timestamp
 */
export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

/**
 * Full transcript data
 */
export interface TranscriptData {
  text: string;
  // segments: TranscriptSegment[];
  duration: number;
  language: string;
}

/**
 * AI-generated overview
 */
export interface OverviewData {
  summary: string;
  key_points: string[];
  topics: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  recommended_for: string[];
}

/**
 * Video segment with AI analysis
 */
export interface VideoSegment {
  segment_number: number;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  key_concepts: string[];
}

/**
 * AI-generated flashcard
 */
export interface Flashcard {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  category:
    | "technical"
    | "behavioral"
    | "preparation"
    | "tips"
    | "company_culture";
  timestamp: number;
}

/**
 * AI-generated tip
 */
export interface VideoTip {
  tip_text: string;
  category:
    | "preparation"
    | "communication"
    | "technical"
    | "mindset"
    | "follow_up";
  importance: "critical" | "important" | "helpful";
  context?: string;
  timestamp: number | null;
}

/**
 * Complete AI processing response
 */
export interface ProcessVideoResponse {
  transcript: TranscriptData;
  overview: OverviewData;
  segments: VideoSegment[];
  flashCards: Flashcard[];
  tips: VideoTip[];
}
