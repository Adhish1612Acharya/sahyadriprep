export interface Media {
  id: string;
  url: string;
  public_id: string;
  file_name?: string;
  file_type: string;
  file_size?: number;
  duration?: number;
  width?: number;
  height?: number;
  uploaded_by?: string;
  uploaded_at: string;
  college_id: string;
  usage_type: string;
  upload_provider: "cloudinary" | "google_drive" | "supabase_storage";
  metadata: Record<string, any>;
}
