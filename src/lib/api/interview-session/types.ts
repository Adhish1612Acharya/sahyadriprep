import {
  InterviewSessionFlashcard,
  InterviewSessionOverview,
  InterviewSessionSegment,
  InterviewSessionTip,
} from "@/models";

export interface InterviewSessionAISummary {
  ai: {
    overview: {
      presentInDB: boolean;
      data: InterviewSessionOverview | null;
    };
    segments: {
      presentInDB: boolean;
      count: number;
      data: InterviewSessionSegment[];
    };
    flashCards: {
      presentInDB: boolean;
      count: number;
      data: InterviewSessionFlashcard[];
    };
    tips: {
      presentInDB: boolean;
      count: number;
      data: InterviewSessionTip[];
    };
  };
}
