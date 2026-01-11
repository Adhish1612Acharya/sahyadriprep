export interface InterviewSessionOverview {
  id: string;
  youtube_video_id: string;
  summary: string;
  key_points: string[] | null;
  topics: string[] | null;
  difficulty_level: "beginner" | "intermediate" | "advanced" | null;
  recommended_for: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}
