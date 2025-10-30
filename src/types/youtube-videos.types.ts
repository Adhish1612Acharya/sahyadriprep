export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptData {
  text: string;
  segments: TranscriptSegment[];
  duration: number;
  language: string;
}

export interface TranscriptChunk {
  text: string;
  start_time: number;
  end_time: number;
  segment_count: number;
}
