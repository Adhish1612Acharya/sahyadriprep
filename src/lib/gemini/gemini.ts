  // import { GoogleGenerativeAI } from "@google/generative-ai";

  // /**
  //  * Get Gemini model instance with custom API key
  //  */
  // export const getGeminiModel = (
  //   apiKey: string,
  //   modelName: string = "gemini-2.5-flash"
  // ) => {
  //   if (!apiKey) {
  //     throw new Error("Gemini API key is required");
  //   }

  //   const genAI = new GoogleGenerativeAI(apiKey);

  //   return genAI.getGenerativeModel({
  //     model: modelName,
  //     generationConfig: {
  //       temperature: 0.7,
  //       topP: 0.95,
  //       topK: 40,
  //       maxOutputTokens: 8192,
  //       responseMimeType: "application/json", // ✅ Force JSON response
  //     },
  //   });
  // };

  // /**
  //  * Helper function to call Gemini and parse JSON response
  //  */
  // export async function callGemini(
  //   prompt: string,
  //   apiKey: string,
  //   modelName: string = "gemini-2.5-flash"
  // ) {
  //   const model = getGeminiModel(apiKey, modelName);

  //   const result = await model.generateContent(prompt);
  //   const response = result.response;
  //   const text = response.text();

  //   if (!text) {
  //     throw new Error("No response from Gemini");
  //   }

  //   try {
  //     // Remove markdown code blocks if present
  //     const cleanedText = text
  //       .replace(/```json\n?/g, "")
  //       .replace(/```\n?/g, "")
  //       .trim();

  //     return JSON.parse(cleanedText);
  //   } catch (e) {
  //     console.error("Failed to parse JSON from Gemini:", text);
  //     throw new Error("Invalid JSON response from AI");
  //   }
  // }





  import { GoogleGenerativeAI } from "@google/generative-ai";

  /**
   * Get Gemini model instance for JSON responses
   */
  export const getGeminiModel = (
    apiKey: string,
    modelName: string = "gemini-2.5-flash"
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
        responseMimeType: "application/json", // ✅ JSON mode
      },
    });
  };

  /**
   * Get Gemini model instance for plain text responses
   */
  export const getGeminiTextModel = (
    apiKey: string,
    modelName: string = "gemini-2.5-flash"
  ) => {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    return genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Lower temperature for summaries
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 500, // Shorter for summaries
        // ❌ No responseMimeType - defaults to text/plain
      },
    });
  };

  /**
   * Call Gemini and parse JSON response
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

  /**
   * Call Gemini for plain text generation (summaries, etc.)
   */
  export async function callGeminiText(
    prompt: string,
    apiKey: string,
    modelName: string = "gemini-2.5-flash"
  ): Promise<string> {
    const model = getGeminiTextModel(apiKey, modelName);

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text || typeof text !== "string") {
        throw new Error("No valid text response from Gemini");
      }

      return text.trim();
    } catch (error: any) {
      console.error("Gemini text generation error:", error);
      throw new Error(`Gemini error: ${error.message}`);
    }
  }
