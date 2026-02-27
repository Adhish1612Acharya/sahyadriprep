import { MediaLearningResourceWithMedia } from "@/lib/repositories/media-learning-resources";
import { LearningResource, YoutubeLearningResource } from "@/models";

export interface LearningResourceWithExtensions extends LearningResource {
  youtube_learning_resource:
    | (YoutubeLearningResource & {
        segment_count?: number;
        direct_media_count?: number;
      })
    | null;
  direct_media_resource: MediaLearningResourceWithMedia | null;
}
