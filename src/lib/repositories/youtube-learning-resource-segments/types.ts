import { YoutubeLearningResourceSegment } from "@/models";

export type CreateSegmentInput = Pick<
  YoutubeLearningResourceSegment,
  "youtube_learning_resource_id" | "title" | "start_time" | "end_time" | "created_by"
> &
  Partial<Pick<YoutubeLearningResourceSegment, "description">>;