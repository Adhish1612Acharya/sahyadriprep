export interface VerifyCollegeRequest {
  user_id: string;
  college_id?: string | null;
}

export interface VerifyCollegeResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  message?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: "student" | "college_admin";
  college_id?: string | null;
}

export interface SignupResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}
