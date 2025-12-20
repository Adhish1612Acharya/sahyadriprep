export type OverviewResponse = {
  summary: string;
  key_points: string[];
  topics: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  recommended_for: string[];
};

export type Segment = {
  segment_number: number;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  key_concepts: string[];
};

export type Flashcard = {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  category:
    | "technical"
    | "behavioral"
    | "preparation"
    | "tips"
    | "company_culture";
  timestamp: number | null;
};

export type Tip = {
  tip_text: string;
  category:
    | "preparation"
    | "communication"
    | "technical"
    | "mindset"
    | "follow_up";
  importance: "critical" | "important" | "helpful";
  context?: string;
  timestamp: number | null;
};

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
  index?: number;
}

export interface TranscriptData {
  text: string;
  segments: TranscriptSegment[];
  duration: number;
  language: string;
}
