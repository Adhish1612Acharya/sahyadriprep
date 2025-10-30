import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get Gemini model instance with custom API key
 */
export const getGeminiModel = (
  apiKey: string,
  modelName: string = "gemini-1.5-flash"
) => {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json", // ✅ Force JSON response
    },
  });
};

/**
 * Helper function to call Gemini and parse JSON response
 */
export async function callGemini(
  prompt: string,
  apiKey: string,
  modelName: string = "gemini-2.5-flash"
) {
  const model = getGeminiModel(apiKey, modelName);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", text);
    throw new Error("Invalid JSON response from AI");
  }
}
