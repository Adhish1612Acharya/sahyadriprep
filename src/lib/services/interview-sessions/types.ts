import { Flashcard, OverviewResponse, Segment, Tip } from "@/features/youtube";

export interface InterviewSessionAISummarizationResult {
  videoId: string;
  transcript: {
    text: string;
    segmentsCount: number;
    duration: number;
    language: string;
  };
  overview: OverviewResponse;
  segments: {
    count: number;
    data: Segment[];
  }
    flashCards: {
      count: number;
      data: Flashcard[];
    };
    tips: {
      count: number;
      data: Tip[];
    };
    metaData: {
      processedAt: string;
      processingTimeMs: number;
    };
  };

