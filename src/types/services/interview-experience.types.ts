export interface CreateInterviewExperienceInput {
  document: File;
  video_preview?: File;
  studentName?: string;
  college_id: string;
  company_id: string;
  batch: string;
  placedYear?: number;
}

export interface InterviewExperienceResponse {
  success: boolean;
  message: string;
  data: {
    experienceId: string;
    mediaId: string;
    videoMediaId: string | null;
    collegeId: string;
    companyId: string;
    chunksStored: number;
    cloudinaryUrl: string;
    videoUrl: string | null;
  };
}

export interface InterviewExperience {
  id: string;
  student_name: string | null;
  college_id: string;
  company_id: string;
  batch: string;
  placed_year: number | null;
  document_media_id: string;
  video_media_id: string | null;
  chunks_stored: number;
  created_at: string;
  updated_at: string;
  companies?: {
    id: string;
    name: string;
    logo_url: string | null;
    industry: string | null;
  };
  colleges?: {
    id: string;
    name: string;
  };
  document_media?: {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  };
  video_media?: {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  };
}
