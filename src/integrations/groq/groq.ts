// integrations/groq/groq.ts
import Groq from "groq-sdk";
import { ENV } from "@/config/env";
import { GroqChatMessage, GroqChatOptions } from "./groq.types";

const groqClient = new Groq({ apiKey: ENV.GROQ_API_KEY });

export async function callGroqChatMessages(
  messages: GroqChatMessage[],
  options: GroqChatOptions = {}
): Promise<string> {
  const {
    model = "llama-3.3-70b-versatile",
    temperature = 0.3,
    maxTokens = 1500,
    topP = 0.9,
  } = options;

  const completion = await groqClient.chat.completions.create({
    messages,
    model,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");
  return content.trim();
}
