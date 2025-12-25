export const TABLES = {
  // Core entities
  colleges: "colleges" as const,
  companies: "companies" as const,
  collegeAdminProfiles: "college_admin_profiles" as const,
  studentProfiles: "student_profiles" as const,
  profiles: "profiles" as const,

  // Content & Resources
  subjects: "subjects" as const,
  modules: "modules" as const,
  exams: "exams" as const,
  resources: "resources" as const,
  coreSubjectsResource: "core_subjects_resource" as const,
  notes: "notes" as const,

  // Interview Experiences
  interviewExperiences: "interview_experiences" as const,

  // YouTube Videos
  interviewSessions: "youtube_videos" as const,
  youtubeVideoOverviews: "youtube_video_overviews" as const,
  youtubeVideoSegments: "youtube_video_segments" as const,
  youtubeVideoFlashcards: "youtube_video_flashcards" as const,
  youtubeVideoTips: "youtube_video_tips" as const,

  // Media
  media: "media" as const,

  // Playlists
  playlists: "playlists" as const,
  playlistsResourcesMap: "playlists_resources_map" as const,

  // Important Questions & Topics
  importantQuestions: "important__questions" as const,
  importantTopics: "important__topics" as const,
  importantQuestionTextAnswers: "important__question__text__answers" as const,
  importantQuestionVideoAnswers: "important__question__video__answers" as const,
  importantTopicTextAnswers: "important__topic__text__answers" as const,
  importantTopicVideoAnswers: "important__topic__video__answers" as const,
} as const;
