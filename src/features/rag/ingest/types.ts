export type EmbeddingResult<T extends string | string[]> = T extends string
  ? number[]
  : number[][];
