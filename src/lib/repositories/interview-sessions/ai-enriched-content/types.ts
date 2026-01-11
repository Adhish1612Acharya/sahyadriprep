export interface InterviewSessionOverviewInputRecord {
  youtube_video_id: string;
  summary: string;
  key_points: string[];
  topics: string[];
  difficulty_level: string;
  recommended_for: string[];
  created_at: string;
  updated_at: string;
}


export interface InterviewSessionSegmentInputRecord {
  youtube_video_id: string;
  segment_number: number;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  key_concepts: string[];
  created_at: string;
  updated_at: string;
}


export interface InterviewSessionFlashcardInputRecord {
  youtube_video_id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
  timestamp: number | null;
  created_at: string;
  updated_at: string;
}


export interface InterviewSessionTipInputRecord {
  youtube_video_id: string;
  tip_text: string;
  category: string;
  importance: string;
  context: string | null;
  timestamp: number | null;
  created_at: string;
  updated_at: string;
}
