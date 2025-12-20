import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiMode, GeminiModelOptions } from "./gemini.types";

/**
 * Internal: create a configured Gemini model (JSON or text)
 */
function createGeminiModel({
  apiKey,
  modelName = "gemini-2.5-flash",
  mode = "text",
  maxOutputTokens,
  temperature,
  topP,
  topK,
  schema,
}: GeminiModelOptions) {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig: Record<string, unknown> = {
    temperature,
    topP,
    topK,
    maxOutputTokens,
  };

  if (mode === "json") {
    generationConfig.responseMimeType = "application/json";
    if (schema) {
      generationConfig.responseSchema = schema;
    }
  }

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig,
  });
}

/**
 * High-level: call Gemini and optionally parse JSON
 */
export async function callGemini<TParsed = unknown>({
  prompt,
  apiKey,
  modelName = "gemini-2.5-flash",
  mode = "text", // "text" | "json"
  maxOutputTokens,
  temperature,
  topP,
  topK,
  schema,
}: {
  prompt: string;
  apiKey: string;
  modelName?: string;
  mode?: GeminiMode;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  schema?: object;
}): Promise<TParsed | string> {
  const model = createGeminiModel({
    apiKey,
    modelName,
    mode,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    schema,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error("No response from Gemini");
  }

  if (mode === "text") {
    return text.trim();
  }

  // mode === "json"
  try {
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedText) as TParsed;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", text);
    throw new Error("Invalid JSON response from AI");
  }
}

/**
 * Convenience wrappers if you still want two simple functions
 */

export async function callGeminiJson<T = unknown>(
  prompt: string,
  apiKey: string,
  schema: object,
  modelName = "gemini-2.5-flash"
): Promise<T> {
  return callGemini<T>({
    prompt,
    apiKey,
    modelName,
    mode: "json",
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    schema,
  }) as Promise<T>;
}

export async function callGeminiText(
  prompt: string,
  apiKey: string,
  modelName = "gemini-2.5-flash"
): Promise<string> {
  return callGemini({
    prompt,
    apiKey,
    modelName,
    mode: "text",
    maxOutputTokens: 500,
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
  }) as Promise<string>;
}
