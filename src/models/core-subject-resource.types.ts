export interface CoreSubjectsResourceDB {
  id: string;
  college_id: string | null;
  subject_id: string | null;
  title: string;
  description: string | null;
  topics: string[] | null;
  special_note: string | null;
  video_media_id: string | null;
  reference_notes_media_id: string | null;
  thumbnail_media_id: string | null;
  revision_notes_media_id: string | null;
  created_by: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
