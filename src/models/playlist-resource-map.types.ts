export interface PlaylistResourceMapDB {
  id: string;
  college_id: string | null;
  playlist_id: string;
  resource_id: string;
  order_index: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
