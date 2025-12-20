import { callGeminiJson } from "@/integrations/gemini/gemini";

export async function generateStructuredAiOutput<T>(
  prompt: string,
  apiKey: string,
  schema: object
): Promise<T> {
  return await callGeminiJson<T>(prompt, apiKey, { schema });
}
