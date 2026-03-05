export const TABLES = {
  // Core entities
  colleges: "colleges" as const,
  companies: "companies" as const,
  collegeAdminProfiles: "college_admin_profiles" as const,
  studentProfiles: "student_profiles" as const,
  profiles: "profiles" as const,

  // Interview Experiences
  interviewExperiences: "interview_experiences" as const,

  // YouTube Videos
  interviewSessions: "youtube_videos" as const,
  interviewSessionOverviews: "youtube_video_overviews" as const,
  interviewSessionSegments: "youtube_video_segments" as const,
  interviewSessionFlashcards: "youtube_video_flashcards" as const,
  interviewSessionTips: "youtube_video_tips" as const,

  // Learning Collections
  learningCollections: "learning_collections" as const,
  learningResources: "learning_resources" as const,
  mediaLearningResources: "media_learning_resources" as const,
  youtubeLearningResources: "youtube_learning_resources" as const,
  youtubeLearningResourceDirectMedia:
    "youtube_learning_resource_direct_media" as const,
  youtubeLearningResourceSegments:
    "youtube_learning_resource_segments" as const,
  segmentMediaAttachments: "segment_media_attachments" as const,

  collectionReferences: "collection_references",
  resourceReferences: "resource_references",
  youtubeReferencesMetadata: "youtube_references_metadata",

  // Media
  media: "media" as const,
} as const;

export const vectorStoreTables = {
  contentChunks: "content_chunks" as const,
} as const;
