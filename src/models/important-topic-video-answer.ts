export interface ImportantTopicVideoAnswer {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  media_id: string;
  is_ai_generated: boolean;
  created_by: string;
  created_at: string;
}
