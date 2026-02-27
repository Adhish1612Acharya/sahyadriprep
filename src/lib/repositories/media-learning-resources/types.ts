import { Media, MediaLearningResource } from "@/models";

export interface MediaLearningResourceWithMedia extends MediaLearningResource {
  media: Media;
}
