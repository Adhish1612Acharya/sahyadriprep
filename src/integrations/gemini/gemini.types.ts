export type GeminiMode = "json" | "text";

export type GeminiModelOptions = {
  apiKey: string;
  modelName?: string;
  mode?: GeminiMode;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  schema?: object;
};
