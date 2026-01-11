export interface InterviewSessionFlashcard {
  id: string;
  youtube_video_id: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  category:
    | "technical"
    | "behavioral"
    | "preparation"
    | "tips"
    | "company_culture";
  timestamp: number | null;
  created_at: string | null;
  updated_at: string | null;
}
