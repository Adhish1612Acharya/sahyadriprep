export interface PlaylistDB {
  id: string;
  college_id: string | null;
  title: string;
  description: string | null;
  subject_id: string | null;
  created_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
