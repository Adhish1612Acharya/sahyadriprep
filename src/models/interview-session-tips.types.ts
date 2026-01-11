export interface InterviewSessionTip {
  id: string;
  youtube_video_id: string;
  tip_text: string;
  category: 'preparation' | 'communication' | 'technical' | 'mindset' | 'follow_up';
  importance: 'critical' | 'important' | 'helpful';
  context: string | null;
  timestamp: number | null;
  created_at: string | null;
  updated_at: string | null;
}