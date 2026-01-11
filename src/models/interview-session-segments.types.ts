export interface InterviewSessionSegment {
  id: string;
  youtube_video_id: string;
  segment_number: number;
  title: string;
  description: string | null;
  start_time: number;
  end_time: number;
  key_concepts: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}
