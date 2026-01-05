export interface MediaCreateInput {
  url: string;
  public_id: string;
  file_name: string | null;
  file_type: string;
  file_size: number | null;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  uploaded_by: string | null;
  college_id: string;
  usage_type: "interview_experience" | "profile" | string;
  metadata: Record<string, any>;
}
