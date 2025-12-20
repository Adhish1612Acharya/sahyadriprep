export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};
