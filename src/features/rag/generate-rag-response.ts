// features/rag/generate-rag-response.ts
import { callGroqChatMessages } from "@/integrations/groq/groq";
import { AI_PROMPTS } from "@/constants/ai-prompts";

export async function generateRAGResponse(
  userMessage: string,
  context: string,
): Promise<{ content: string }> {
  try {
    const systemPrompt = AI_PROMPTS.ragGroqSystem();
    const userPrompt = AI_PROMPTS.ragGroqUserTurn({ userMessage, context });

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    const content = await callGroqChatMessages(messages, {
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      maxTokens: 1500,
      topP: 0.9,
    });

    return { content };
  } catch (error) {
    console.error("❌ Groq API Error:", error);
    throw error;
  }
}
