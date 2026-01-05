export interface InterviewSession {
  id: string;
  video_id: string;
  video_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  company_id: string | null;
  college_id: string | null;
  created_at: string;
  updated_at: string;
  ai_process_done: boolean;
  ai_process_count: number | null;
  ai_process_metadata: Record<string, any> | null;
  created_by: string | null;
}
