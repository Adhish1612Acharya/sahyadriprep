/**
 * API endpoint constants for consistent URL management
 */

// ============================================
// EXAM ENDPOINTS
// ============================================
export const EXAM_ENDPOINTS = {
  BASE: `/exams`,
  BY_ID: (id: string) => `/exams/${id}`,
  BY_SUBJECT: (subjectId: string) => `/exams?subject_id=${subjectId}`,
} as const;

// ============================================
// INTERVIEW EXPERIENCE ENDPOINTS
// ============================================
export const INTERVIEW_EXPERIENCE_ENDPOINTS = {
  BASE: `/interview-experiences`,
  BY_ID: (id: string) => `/interview-experiences/${id}`,
  BY_COLLEGE: (collegeId: string) =>
    `/interview-experiences?college_id=${collegeId}`,
  BY_COMPANY: (companyId: string) =>
    `/interview-experiences?company_id=${companyId}`,
  BY_BATCH: (batch: string) => `/interview-experiences?batch=${batch}`,
  SEND: `/interview-experiences/sahyadri/send`,
} as const;

// ============================================
// SUBJECT ENDPOINTS
// ============================================
export const SUBJECT_ENDPOINTS = {
  BASE: `/subjects`,
  BY_ID: (id: string) => `/subjects/${id}`,
} as const;

// ============================================
// MODULE ENDPOINTS
// ============================================
export const MODULE_ENDPOINTS = {
  BASE: `/modules`,
  BY_ID: (id: string) => `/modules/${id}`,
  BY_SUBJECT: (subjectId: string) => `/modules?subject_id=${subjectId}`,
} as const;

// ============================================
// MEDIA ENDPOINTS
// ============================================
export const MEDIA_ENDPOINTS = {
  BASE: `/media`,
  BY_ID: (id: string) => `/media/${id}`,
  UPLOAD: `/media/upload`,
  DELETE: (id: string) => `/media/${id}`,
} as const;

// ============================================
// CONTENT CHUNK ENDPOINTS (Vector Store)
// ============================================
export const CONTENT_CHUNK_ENDPOINTS = {
  BASE: `/content-chunks`,
  BY_ID: (id: string) => `/content-chunks/${id}`,
  SEARCH: `/content-chunks/search`,
  BY_TYPE: (type: string) => `/content-chunks?type=${type}`,
} as const;

// ============================================
// CHAT ENDPOINTS (RAG Chatbot)
// ============================================
export const CHAT_ENDPOINTS = {
  BASE: `/rag/chat`,
  SEND_MESSAGE: `/rag/chat`,
  SESSIONS: `/rag/chat/sessions`,
  SESSION_BY_ID: (sessionId: string) => `/rag/chat/sessions/${sessionId}`,
  MESSAGES: (sessionId: string) => `/rag/chat/sessions/${sessionId}/messages`,
} as const;

// ============================================
// USER ENDPOINTS
// ============================================
export const USER_ENDPOINTS = {
  BASE: `/users`,
  BY_ID: (id: string) => `/users/${id}`,
  PROFILE: `/users/profile`,
  UPDATE_PROFILE: `/users/profile`,
} as const;

// ============================================
// AUTH ENDPOINTS
// ============================================
export const AUTH_ENDPOINTS = {
  LOGIN: `/auth/login`,
  LOGOUT: `/auth/logout`,
  SIGNUP: (redirectUrl?: string) =>
    `/auth/sign-up?redirect=${encodeURIComponent(redirectUrl || "/")}`,
  REGISTER: `/auth/register`,
  REFRESH: `/auth/refresh`,
  FORGOT_PASSWORD: `/auth/forgot-password`,
  RESET_PASSWORD: `/auth/reset-password`,
  VERIFY_COLLEGE: `/auth/verify-college`,
} as const;

// ============================================
// COLLEGE ENDPOINTS
// ============================================
export const COLLEGE_ENDPOINTS = {
  BASE: `/colleges`,
  BY_ID: (id: string) => `/colleges/${id}`,
} as const;

// ============================================
// IMPORTANT TOPIC ENDPOINTS
// ============================================
export const IMPORTANT_TOPIC_ENDPOINTS = {
  BASE: `/important-topics`,
  BY_ID: (id: string) => `/important-topics/${id}`,
  BY_SUBJECT: (subjectId: string) =>
    `/important-topics?subject_id=${subjectId}`,
} as const;

// ============================================
// YOUTUBE ENDPOINTS
// ============================================

export const YOUTUBE_ENDPOINTS = {
  BASE: `/interview-experiences/youtube-videos`,
  BY_ID: (id: string) => `/interview-experiences/youtube-videos/${id}`,
  BY_COMPANY: (companyId: string) =>
    `/interview-experiences/youtube-videos?company_id=${companyId}`,
  BY_COLLEGE: (collegeId: string) =>
    `/interview-experiences/youtube-videos?college_id=${collegeId}`,
  PROCESS: (id: string) =>
    `/interview-experiences/youtube-videos/${id}/process`,
  AI: (id: string) => `/interview-experiences/youtube-videos/${id}/ai`,
} as const;

// ============================================
// COMPANY ENDPOINTS
// ============================================

export const COMPANY_ENDPOINTS = {
  BASE: "/companies",
  BY_ID: (id: string) => `/companies/${id}`,
  SEARCH: (query: string) => `/companies?search=${encodeURIComponent(query)}`,
  BY_INDUSTRY: (industry: string) =>
    `/companies?industry=${encodeURIComponent(industry)}`,
  BY_COLLEGE: (collegeId: string) => `/companies?college_id=${collegeId}`,
} as const;

// ============================================
// PROFILE ENDPOINTS
// ============================================
export const PROFILE_ENDPOINTS = {
  BASE: "/profile",
  ME: "/profile/me",
  UPDATE: "/profile/update",
  AVATAR: "/profile/avatar",
  RESUME: "/profile/resume",
} as const;

// ============================================
// STUDENT ENDPOINTS
// ============================================
export const STUDENT_ENDPOINTS = {
  GET: `/students`,
} as const;

// ============================================
// AGGREGATE ALL ENDPOINTS (for reference)
// ============================================
export const API_ENDPOINTS = {
  EXAMS: EXAM_ENDPOINTS,
  INTERVIEW_EXPERIENCES: INTERVIEW_EXPERIENCE_ENDPOINTS,
  SUBJECTS: SUBJECT_ENDPOINTS,
  MODULES: MODULE_ENDPOINTS,
  MEDIA: MEDIA_ENDPOINTS,
  CONTENT_CHUNKS: CONTENT_CHUNK_ENDPOINTS,
  CHAT: CHAT_ENDPOINTS,
  USERS: USER_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  COLLEGES: COLLEGE_ENDPOINTS,
  COMPANIES: COMPANY_ENDPOINTS,
  IMPORTANT_TOPICS: IMPORTANT_TOPIC_ENDPOINTS,
  YOUTUBE: YOUTUBE_ENDPOINTS,
  PROFILE: PROFILE_ENDPOINTS,
  STUDENT: STUDENT_ENDPOINTS,
} as const;
