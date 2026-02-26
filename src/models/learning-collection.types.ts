export interface LearningCollection {
  id: string;
  title: string;
  description: string | null;
  thumbnail_media_id: string | null;
  status: "draft" | "published";
  visibility: "public" | "private";
  is_premium: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
