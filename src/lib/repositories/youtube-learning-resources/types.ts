  export type YoutubeLearningResourceCreateInput = Pick<
    YoutubeLearningResource,
    | "resource_id"
    | "youtube_video_id"
    | "duration_seconds"
    | "segments_available"
    | "direct_media_resources_available"
    | "created_by"
  > &
    Partial<Pick<YoutubeLearningResource, "is_publishable">>;