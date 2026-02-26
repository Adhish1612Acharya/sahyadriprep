import { YoutubeLearningResourceDirectMedia } from "@/models";

export type LinkYouTubeDirectMediaInput = Pick<
  YoutubeLearningResourceDirectMedia,
  "youtube_learning_resource_id" | "media_id" | "label" | "created_by"
> &
  Partial<Pick<YoutubeLearningResourceDirectMedia, "position">>;