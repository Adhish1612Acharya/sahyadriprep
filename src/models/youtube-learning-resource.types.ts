export type YoutubeLearningResource = {
  id: string;
  resource_id: string;
  youtube_video_id: string;
  duration_seconds: number | null;
  segments_available: boolean;
  direct_media_resources_available: boolean;
  is_publishable: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

