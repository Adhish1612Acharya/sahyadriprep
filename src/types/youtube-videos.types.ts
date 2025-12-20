export interface TranscriptChunk {
  text: string;
  start_time: number;
  end_time: number;
  segment_count: number;
}

export interface ChunkWithMetadata {
  text: string;
  start_time: number;
  end_time: number;
  segment_start: number;
  segment_end: number;
  segment_count: number;
  word_count: number;
  chunk_index: number;
}
