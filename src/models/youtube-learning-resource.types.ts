export type YoutubeLearningResource = {
  id: string;
  resourceId: string;
  youtubeVideoId: string;
  durationSeconds: number | null;
  segmentsAvailable: boolean | null;
  createdAt: string;
  updatedAt: string;
};
